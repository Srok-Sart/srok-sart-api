import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationResult } from 'src/interfaces/paginate-result.interface';
import { Material } from 'src/materials/entities/material.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { PostMaterialsService } from '../services/post-material.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

interface QueryParams {
  search?: string;
  filter?: string;
  userId?: number;
  sort?: string;
  page: number;
  limit: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    private fileUploadService: FileUploadService,
    private postMaterialsService: PostMaterialsService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    files: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
    userId: number,
  ) {
    const thumbnailUrl = files.thumbnail?.length
      ? await this.fileUploadService.saveFile(files.thumbnail[0])
      : null;

    const imageUrls = files.contents?.length
      ? await this.fileUploadService.saveMultipleFiles(files.contents)
      : [];

    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Parse materials if needed
    const materials = Array.isArray(createPostDto.materials)
      ? createPostDto.materials
      : JSON.parse(createPostDto.materials as any);

    const postData = {
      ...createPostDto,
      thumbnailUrl,
      imageUrls,
      user,
      materials,
    };

    const post = this.postRepository.create(postData);
    const savedPost = await this.postRepository.save(post);

    // Add materials to the post
    const postMaterials = await this.postMaterialsService.addMaterialsToPost(
      savedPost.id,
      materials,
    );

    return {
      ...savedPost,
      postMaterials,
    };
  }

  async findAll({
    search,
    filter,
    userId,
    sort,
    page,
    limit,
  }: QueryParams): Promise<PaginationResult<Post>> {
    const qb = this.postRepository.createQueryBuilder('post');

    // Global search on title and description fields.
    if (search) {
      qb.andWhere(
        '(post.title ILIKE :search OR post.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by userId if provided
    if (userId) {
      qb.andWhere('post.user = :userId', { userId });
    }

    // Dynamic Filtering: expects comma-separated "field:value" pairs.
    if (filter) {
      const allowedFilters = ['postType', 'postDifficulty', 'postStatus'];
      const filters = filter.split(',');
      filters.forEach((f) => {
        const [field, value] = f.split(':');
        if (field && value && allowedFilters.includes(field)) {
          qb.andWhere(`post.${field} = :${field}`, { [field]: value });
        }
      });
    }

    // Dynamic Sorting: supports multiple fields, comma-separated "field:order".
    if (sort) {
      const sortParams = sort.split(',');
      sortParams.forEach((s) => {
        const [field, order] = s.split(':');
        qb.addOrderBy(
          `post.${field}`,
          order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      });
    } else {
      qb.addOrderBy('post.createdAt', 'DESC');
    }

    // Apply pagination
    qb.skip((page - 1) * limit).take(limit);

    // Execute the query and get results along with total count for pagination.
    const [data, total] = await qb.getManyAndCount();

    // For each post, fetch the associated materials and append them as "postMaterials"
    const postsWithMaterials = await Promise.all(
      data.map(async (post) => {
        const postMaterials =
          await this.postMaterialsService.getMaterialsByPost(post.id);
        return { ...post, postMaterials };
      }),
    );

    return { data: postsWithMaterials, total, page, limit };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        estimatedTime: true,
        postType: true,
        thumbnailUrl: true,
        imageUrls: true,
        postDifficulty: true,
        postStatus: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Fetch post materials separately
    const postMaterials =
      await this.postMaterialsService.getMaterialsByPost(id);

    return {
      ...post,
      postMaterials,
    } as Post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    files?: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
  ) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    let thumbnailUrl = post.thumbnailUrl;
    if (files?.thumbnail?.length) {
      thumbnailUrl = await this.fileUploadService.saveFile(files.thumbnail[0]);
    }

    let imageUrls = post.imageUrls || [];
    if (files?.contents?.length) {
      imageUrls = await this.fileUploadService.saveMultipleFiles(
        files.contents,
      );
    }

    // Update post data first
    const updatedPostData = {
      ...post,
      ...updatePostDto,
      thumbnailUrl,
      imageUrls,
    };

    // Save the post updates
    const updatedPost = await this.postRepository.save(updatedPostData);

    // Handle material updates if provided
    let postMaterials = await this.postMaterialsService.getMaterialsByPost(id);

    if (
      updatePostDto.materials &&
      (Array.isArray(updatePostDto.materials) ||
        typeof updatePostDto.materials === 'string')
    ) {
      // Parse materials if needed
      const materials = Array.isArray(updatePostDto.materials)
        ? updatePostDto.materials
        : JSON.parse(updatePostDto.materials as any);

      // Update post materials
      postMaterials = await this.postMaterialsService.updatePostMaterials(
        id,
        materials,
      );
    }

    return {
      ...updatedPost,
      postMaterials,
    };
  }

  async remove(id: number) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Remove associated post materials
    await this.postMaterialsService.removePostMaterials(id);

    // Remove the post
    return this.postRepository.remove(post);
  }

  async markAsCompleted(id: number) {
    return this.postRepository.increment({ id }, 'completionCount', 1);
  }
}

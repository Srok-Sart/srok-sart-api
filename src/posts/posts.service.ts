import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PaginationResult } from 'src/interfaces/paginate-result.interface';
import { User } from '../users/entities/user.entity';

interface QueryParams {
  search?: string;
  filter?: string;
  sort?: string;
  page: number;
  limit: number;
  userId?: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private fileUploadService: FileUploadService,
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
  
    const postData = {
      ...createPostDto,
      thumbnailUrl,
      imageUrls,
      user, 
      userId, 
    };
  
    const post = this.postRepository.create(postData);
    return await this.postRepository.save(post);
  }

  async findAll({
    search,
    filter,
    sort,
    page,
    limit,
    userId,
  }: QueryParams): Promise<PaginationResult<Post>> {
    const qb = this.postRepository.createQueryBuilder('post');

    // Add the user relation to the query
    qb.leftJoinAndSelect('post.user', 'user');

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
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    files?: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
  ) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Upload new files if provided
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

    // Merge updates into existing post
    const updatedPost = {
      ...post,
      ...updatePostDto,
      thumbnailUrl,
      imageUrls,
    };

    return await this.postRepository.save(updatedPost);
  }

  async remove(id: number) {
    const post = await this.postRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return await this.postRepository.remove(post);
  }
}
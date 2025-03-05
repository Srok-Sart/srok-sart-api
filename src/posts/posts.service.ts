import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { User } from '../users/entities/user.entity';
import { PaginationResult } from 'src/interfaces/paginate-result.interface';

interface QueryParams {
  search?: string;
  filter?: string;
  sort?: string;
  page: number;
  limit: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(PostLike) private postLikeRepository: Repository<PostLike>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    files: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
  ) {
    const thumbnailUrl = files.thumbnail?.length
      ? await this.fileUploadService.saveFile(files.thumbnail[0])
      : null;

    const imageUrls = files.contents?.length
      ? await this.fileUploadService.saveMultipleFiles(files.contents)
      : [];

    const postData = {
      ...createPostDto,
      thumbnailUrl,
      imageUrls,
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
  }: QueryParams): Promise<PaginationResult<Post>> {
    const qb = this.postRepository.createQueryBuilder('post');

    // Global search on title and description fields.
    if (search) {
      qb.andWhere(
        '(post.title ILIKE :search OR post.description ILIKE :search)',
        { search: `%${search}%` },
      );
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

  async incrementLike(id: number) {
    const post = await this.findOne(id);
    post.likeCount += 1;
    await this.postRepository.save(post);
    return { success: true, likeCount: post.likeCount };
  }

  async decrementLike(id: number) {
    const post = await this.findOne(id);
    if (post.likeCount > 0) {
      post.likeCount -= 1;
    }
    await this.postRepository.save(post);
    return { success: true, likeCount: post.likeCount };
  }

  async getLikedPosts(userId: number): Promise<number[]> {
    const likes = await this.postLikeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });
    
    return likes.map(like => like.post.id);
  }

  async likePost(postId: number, userId: number) {
    const post = await this.findOne(postId);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    const like = this.postLikeRepository.create({
      post,
      user,
    });

    await this.postLikeRepository.save(like);

    post.likeCount += 1;
    await this.postRepository.save(post);

    return {
      success: true,
      likeCount: post.likeCount,
    };
  }

  async unlikePost(postId: number, userId: number) {
    // Check if the post exists
    const post = await this.findOne(postId);

    // Find the like
    const like = await this.postLikeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (!like) {
      throw new NotFoundException('You have not liked this post');
    }

    // Remove the like
    await this.postLikeRepository.remove(like);

    // Decrement the like count on the post
    if (post.likeCount > 0) {
      post.likeCount -= 1;
      await this.postRepository.save(post);
    }

    return {
      success: true,
      likeCount: post.likeCount,
    };
  }

  async checkIfUserLikedPost(postId: number, userId: number): Promise<boolean> {
    const like = await this.postLikeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    return !!like;
  }
}

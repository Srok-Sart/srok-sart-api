import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
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

  async findAll(): Promise<Post[]> {
    const posts = await this.postRepository.find();

    return posts;
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
}

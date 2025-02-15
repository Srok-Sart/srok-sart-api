import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, files?: { images?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }) {
    let post = await this.findOne(id); // Ensure post exists

    if (files) {
      const { imageUrls, thumbnailUrl } = this.uploadFiles(files);
      if (imageUrls.length > 0) {
        updatePostDto.imageUrls = imageUrls;
      }
      if (thumbnailUrl) {
        updatePostDto.thumbnailUrl = thumbnailUrl;
      }
    }

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  uploadFiles(files: { images?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }) {
    console.log('Files received (upload service):', files);

    const images = files?.images || [];
    const thumbnailFiles = files?.thumbnail || [];

    if (images.length === 0 && thumbnailFiles.length === 0) {
      throw new BadRequestException('At least one image or thumbnail should be uploaded');
    }

    const imageUrls = images.map((file) => `/uploads/${file.filename}`);
    const thumbnailUrl = thumbnailFiles.length > 0 ? `/uploads/${thumbnailFiles[0].filename}` : null;

    return { imageUrls, thumbnailUrl };
  }

  async getUploadedFile(filename: string, res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    return res.sendFile(filePath);
  }
}
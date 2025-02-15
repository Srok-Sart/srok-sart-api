import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: createCommentDto.postId },
      });
  
      if (!post) {
        throw new NotFoundException(
          `Post with ID ${createCommentDto.postId} not found`,
        );
      }
  
      const comment = this.commentRepository.create({
        ...createCommentDto, 
        userId, 
      });
  
      return await this.commentRepository.save(comment);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('Error creating comment:', error);
    }
  }
  
  async findAll() {
    try {
      return await this.commentRepository.find({
        relations: ['user', 'post'],
      });
    } catch {
      throw new BadRequestException('Failed to fetch comments');
    }
  }

  async findOne(id: number) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id },
        relations: ['user', 'post'],
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch comment');
    }
  }

  async update(id: number, userId: number, updateCommentDto: UpdateCommentDto) {
    const existingComment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (existingComment.userId !== userId) {
      throw new BadRequestException('You can only update your own comments');
    }

    try {
      existingComment.content = updateCommentDto.content;
      return await this.commentRepository.save(existingComment);
    } catch {
      throw new BadRequestException('Failed to update comment');
    }
  }

  async remove(id: number, userId: number) {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    try {
      await this.commentRepository.remove(comment);
      return { message: 'Comment deleted successfully' };
    } catch {
      throw new BadRequestException('Failed to delete comment');
    }
  }
}

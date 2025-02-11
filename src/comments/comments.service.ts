import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto) {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    return await this.commentRepository.save(comment);
  }

  async findAll() {
    return await this.commentRepository.find({
      relations: ['user', 'post'],
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.preload({
      id,
      ...updateCommentDto,
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return await this.commentRepository.save(comment);
  }

  async remove(id: number) {
    const comment = await this.findOne(id);
    await this.commentRepository.remove(comment);
  }
}
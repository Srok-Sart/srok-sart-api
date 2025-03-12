import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostCompletion } from './entities/post-completion.entity';

@Injectable()
export class PostCompletionService {
  constructor(
    @InjectRepository(PostCompletion)
    private postCompletionRepository: Repository<PostCompletion>,
  ) {}

  async create(data: {
    userId: number;
    postId: number;
  }): Promise<PostCompletion> {
    const completion = this.postCompletionRepository.create({
      user: { id: data.userId },
      post: { id: data.postId },
    });

    return this.postCompletionRepository.save(completion);
  }

  async findOne(userId: number, postId: number): Promise<PostCompletion> {
    return this.postCompletionRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
  }

  async getUserCompletions(userId: number): Promise<PostCompletion[]> {
    return this.postCompletionRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['post'],
    });
  }
}

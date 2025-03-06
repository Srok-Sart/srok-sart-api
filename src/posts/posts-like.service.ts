import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getLikedPosts(userId: number): Promise<number[]> {
    const likes = await this.postLikeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });

    return likes.map(like => like.post.id);
  }

  async findOne(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    
    return post;
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
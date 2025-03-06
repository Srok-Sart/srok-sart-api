import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { PostLike } from './entities/post-like.entity';
import { User } from '../users/entities/user.entity';
import { PostLikesService } from './posts-like.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, User])],
  controllers: [PostsController],
  providers: [PostsService, PostLikesService, FileUploadService],
})
export class PostsModule {}
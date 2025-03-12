import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from '../services/file-upload.service';
import { User } from '../users/entities/user.entity';
import { PostCompletion } from './entities/post-completion.entity';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { PostCompletionService } from './post-completion.service';
import { PostLikesService } from './posts-like.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike, User, PostCompletion])],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostLikesService,
    FileUploadService,
    PostCompletionService,
  ],
})
export class PostsModule {}

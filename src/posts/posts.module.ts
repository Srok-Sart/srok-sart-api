import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsModule } from 'src/materials/materials.module';
import { PostMaterialsService } from 'src/services/post-material.service';
import { FileUploadService } from '../services/file-upload.service';
import { User } from '../users/entities/user.entity';
import { PostCompletion } from './entities/post-completion.entity';
import { PostLike } from './entities/post-like.entity';
import { PostMaterial } from './entities/post-material.entity';
import { Post } from './entities/post.entity';
import { PostCompletionService } from './post-completion.service';
import { PostLikesService } from './posts-like.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostLike,
      User,
      PostCompletion,
      PostMaterial,
    ]),
    MaterialsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostLikesService,
    FileUploadService,
    PostCompletionService,
    PostMaterialsService,
  ],
})
export class PostsModule {}

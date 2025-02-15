import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'multer.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    MulterModule.register(multerConfig),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

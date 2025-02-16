import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { PostBookmark } from './entities/post-bookmark.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookmarkCollection, PostBookmark, Post])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
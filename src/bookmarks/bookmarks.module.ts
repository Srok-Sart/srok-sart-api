import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/post.entity';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { PostBookmark } from './entities/post-bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookmarkCollection, PostBookmark, Post])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}

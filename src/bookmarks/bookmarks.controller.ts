import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkCollectionDto } from './dto/create-bookmark-collection.dto';
import { UpdateBookmarkCollectionDto } from './dto/update-bookmark-collection.dto';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';
import { UpdatePostBookmarkDto } from './dto/update-post-bookmark.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  // Bookmark Collection Endpoints
  @Post('collections')
  createCollection(@Body() createDto: CreateBookmarkCollectionDto) {
    return this.bookmarksService.createCollection(createDto);
  }

  @Get('collections')
  findAllCollections() {
    return this.bookmarksService.findAllCollections();
  }

  @Get('collections/:id')
  findOneCollection(@Param('id') id: string) {
    return this.bookmarksService.findOneCollection(+id);
  }

  @Put('collections/:id')
  updateCollection(@Param('id') id: string, @Body() updateDto: UpdateBookmarkCollectionDto) {
    return this.bookmarksService.updateCollection(+id, updateDto);
  }

  @Delete('collections/:id')
  removeCollection(@Param('id') id: string) {
    return this.bookmarksService.removeCollection(+id);
  }

  // Post Bookmark Endpoints
  @Post('post-bookmarks')
  createPostBookmark(@Body() createDto: CreatePostBookmarkDto) {
    return this.bookmarksService.createPostBookmark(createDto);
  }

  @Get('post-bookmarks')
  findAllPostBookmarks() {
    return this.bookmarksService.findAllPostBookmarks();
  }

  @Get('post-bookmarks/:id')
  findOnePostBookmark(@Param('id') id: string) {
    return this.bookmarksService.findOnePostBookmark(+id);
  }

  @Put('post-bookmarks/:id')
  updatePostBookmark(@Param('id') id: string, @Body() updateDto: UpdatePostBookmarkDto) {
    return this.bookmarksService.updatePostBookmark(+id, updateDto);
  }

  @Delete('post-bookmarks/:id')
  removePostBookmark(@Param('id') id: string) {
    return this.bookmarksService.removePostBookmark(+id);
  }
}
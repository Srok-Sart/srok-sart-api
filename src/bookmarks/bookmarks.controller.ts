import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkCollectionDto } from './dto/create-bookmark-collection.dto';
import { UpdateBookmarkCollectionDto } from './dto/update-bookmark-collection.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';
import { UpdatePostBookmarkDto } from './dto/update-post-bookmark.dto';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Public()
  @Post('collections')
  createCollection(
    @Body() createDto: CreateBookmarkCollectionDto,
    @Request() req,
  ) {
    return this.bookmarksService.createCollection(createDto, req);
  }

  @Public()
  @Get('collections')
  findAllCollections() {
    return this.bookmarksService.findAllCollections();
  }

  @Public()
  @Get('collections/:id')
  findOneCollection(@Param('id') id: string) {
    return this.bookmarksService.findOneCollection(+id);
  }

  @Public()
  @Put('collections/:id')
  async updateCollection(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookmarkCollectionDto,
  ) {
    return this.bookmarksService.updateCollection(+id, updateDto);
  }

  @Public()
  @Delete('collections/:id')
  removeCollection(@Param('id') id: string) {
    return this.bookmarksService.removeCollection(+id);
    return { message: 'Collection deleted successfully' };
  }

  // Post Bookmark Endpoints
  @Public()
  @Post('post-bookmarks')
  createPostBookmark(@Body() createDto: CreatePostBookmarkDto) {
    return this.bookmarksService.createPostBookmark(createDto);
  }

  @Public()
  @Get('post-bookmarks')
  findAllPostBookmarks() {
    return this.bookmarksService.findAllPostBookmarks();
  }

  @Public()
  @Get('collections/:collectionId/posts')
  async findPostsInCollection(@Param('collectionId') collectionId: string) {
    const parsedCollectionId = +collectionId; // Convert to number
    if (isNaN(parsedCollectionId)) {
      throw new BadRequestException('Invalid collection ID');
    }
    return this.bookmarksService.findPostsInCollection(parsedCollectionId);
  }

  @Public()
  @Get('post-bookmarks/grouped-by-collection')
  async findAllPostBookmarksGroupedByCollection() {
    return this.bookmarksService.findAllPostBookmarksGroupedByCollection();
  }

  @Public()
  @Get('post-bookmarks/:id')
  findOnePostBookmark(@Param('id') id: string) {
    const parsedId = +id; // Convert the id to a number
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid post bookmark ID');
    }
    return this.bookmarksService.findOnePostBookmark(parsedId);
  }

  @Public()
  @Put('post-bookmarks/:id')
  updatePostBookmark(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostBookmarkDto,
  ) {
    return this.bookmarksService.updatePostBookmark(+id, updateDto);
  }

  @Public()
  @Delete('post-bookmarks/:id')
  removePostBookmark(@Param('id') id: string) {
    return this.bookmarksService.removePostBookmark(+id);
  }

  @Public()
  @Delete('post-bookmarks')
  async unsavePostFromCollection(
    @Body() body: { collectionId: number; postId: number },
  ) {
    const { collectionId, postId } = body;
    return this.bookmarksService.unsavePostFromCollection(collectionId, postId);
  }
}

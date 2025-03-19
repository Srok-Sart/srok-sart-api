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
  UnauthorizedException,
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

  @Post('collections')
  async createCollection(
    @Body() createDto: CreateBookmarkCollectionDto,
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to create bookmark collections',
      );
    }

    return this.bookmarksService.createCollection(createDto, userId);
  }

  @Get('collections')
  findAllCollections(@Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view bookmark collections',
      );
    }

    return this.bookmarksService.findAllCollections(userId);
  }

  @Get('collections/:id')
  findOneCollection(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view bookmark collections',
      );
    }

    return this.bookmarksService.findOneCollection(+id, userId);
  }

  @Put('collections/:id')
  async updateCollection(
    @Param('id') id: string,
    @Body() updateDto: UpdateBookmarkCollectionDto,
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to update bookmark collections',
      );
    }

    return this.bookmarksService.updateCollection(+id, updateDto, userId);
  }

  @Delete('collections/:id')
  async removeCollection(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to delete bookmark collections',
      );
    }

    await this.bookmarksService.removeCollection(+id, userId);
    return { message: 'Collection deleted successfully' };
  }

  @Post('post-bookmarks')
  async createPostBookmark(
    @Body() createDto: CreatePostBookmarkDto,
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to create post bookmarks',
      );
    }

    return this.bookmarksService.createPostBookmark(createDto, userId);
  }

  @Get('post-bookmarks')
  async findAllPostBookmarks(@Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view post bookmarks',
      );
    }

    return this.bookmarksService.findAllPostBookmarks(userId);
  }

  @Get('collections/:collectionId/posts')
  async findPostsInCollection(
    @Param('collectionId') collectionId: string,
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view posts in a collection',
      );
    }

    const parsedCollectionId = +collectionId;
    if (isNaN(parsedCollectionId)) {
      throw new BadRequestException('Invalid collection ID');
    }

    return this.bookmarksService.findPostsInCollection(
      parsedCollectionId,
      userId,
    );
  }

  @Get('post-bookmarks/grouped-by-collection')
  async findAllPostBookmarksGroupedByCollection(@Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view post bookmarks grouped by collection',
      );
    }

    return this.bookmarksService.findAllPostBookmarksGroupedByCollection(userId);
  }

  @Get('post-bookmarks/:id')
  async findOnePostBookmark(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to view a post bookmark',
      );
    }

    const parsedId = +id;
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid post bookmark ID');
    }

    return this.bookmarksService.findOnePostBookmark(parsedId, userId);
  }

  @Put('post-bookmarks/:id')
  async updatePostBookmark(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostBookmarkDto,
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to update a post bookmark',
      );
    }

    return this.bookmarksService.updatePostBookmark(+id, updateDto, userId);
  }

  @Delete('post-bookmarks/:id')
  async removePostBookmark(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to delete a post bookmark',
      );
    }

    return this.bookmarksService.removePostBookmark(+id, userId);
  }

  @Delete('post-bookmarks')
  async unsavePostFromCollection(
    @Body() body: { collectionId: number; postId: number },
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to unsave a post from a collection',
      );
    }

    const { collectionId, postId } = body;
    return this.bookmarksService.unsavePostFromCollection(
      collectionId,
      postId,
      userId,
    );
  }
}
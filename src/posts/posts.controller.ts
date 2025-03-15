import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/auth/decorators/public.decorator';
import {
  MaterialSavedSummary,
  MaterialTrackingService,
} from 'src/posts/material-tracking.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostLikeResponseDto } from './dto/post-like-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostCompletionService } from './post-completion.service';
import { PostLikesService } from './posts-like.service';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postLikesService: PostLikesService,
    private readonly postCompletionService: PostCompletionService,
    private readonly materialTrackingService: MaterialTrackingService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'thumbnail', maxCount: 1 }, { name: 'contents' }],
      {
        storage: memoryStorage(),
      },
    ),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
    @Request() req,
  ) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to create posts',
      );
    }

    return this.postsService.create(createPostDto, files, userId);
  }

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('filter') filter?: string,
    @Query('userId') userId?: string,
    @Query('sort') sort: string = 'createdAt:DESC',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('includeUser') includeUser: string = 'true',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const userIdNumber = userId ? parseInt(userId, 10) : undefined;
    const shouldIncludeUser = includeUser !== 'false';

    return this.postsService.findAll({
      search,
      filter,
      userId: userIdNumber,
      sort,
      page: pageNumber,
      limit: limitNumber,
      includeUser: shouldIncludeUser,
    });
  }

  // Post like related endpoints - now using PostLikesService
  @Get('liked')
  async getLikedPosts(@Request() req) {
    return this.postLikesService.getLikedPosts(req.user.id);
  }

  @Get('saved-materials')
  async getTotalMaterialsSaved(): Promise<MaterialSavedSummary> {
    return this.materialTrackingService.getTotalMaterialsSaved();
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeUser') includeUser: string = 'true',
  ) {
    const shouldIncludeUser = includeUser !== 'false';
    return this.postsService.findOne(+id, shouldIncludeUser);
  }

  @Public()
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'contents', maxCount: 5 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files?: {
      thumbnail?: Express.Multer.File[];
      contents?: Express.Multer.File[];
    },
  ) {
    return this.postsService.update(id, updatePostDto, files);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async likePost(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<PostLikeResponseDto> {
    return this.postLikesService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlikePost(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<PostLikeResponseDto> {
    return this.postLikesService.unlikePost(id, req.user.id);
  }

  @Get(':id/liked')
  async checkIfLiked(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isLiked = await this.postLikesService.checkIfUserLikedPost(
      id,
      req.user.id,
    );
    return { isLiked };
  }

  @Post(':id/complete')
  async markAsCompleted(@Param('id') id: string, @Request() req) {
    const userId = req.user['id'];
    const postId = parseInt(id, 10);

    // Check if user has already completed this post
    const existingCompletion = await this.postCompletionService.findOne(
      userId,
      postId,
    );

    if (existingCompletion) {
      return { message: 'You have already completed this post' };
    }

    // Create completion record
    await this.postCompletionService.create({
      userId,
      postId,
    });

    // Increment the completion count on the post
    await this.postsService.markAsCompleted(postId);

    return { message: 'Post marked as completed successfully' };
  }
}

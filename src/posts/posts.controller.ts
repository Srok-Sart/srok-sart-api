import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { PostLikesService } from './posts-like.service';
import { PostLikeResponseDto } from './dto/post-like-response.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postLikesService: PostLikesService,
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
      throw new UnauthorizedException('User must be authenticated to create posts');
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
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const userIdNumber = userId ? parseInt(userId, 10) : undefined;

    return this.postsService.findAll({
      search,
      filter,
      userId: userIdNumber,
      sort,
      page: pageNumber,
      limit: limitNumber,
    });
  }
  
  // Post like related endpoints - now using PostLikesService
  @Get('liked')
  async getLikedPosts(@Request() req) {
    return this.postLikesService.getLikedPosts(req.user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
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
    @Request() req
  ): Promise<PostLikeResponseDto> {
    return this.postLikesService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async unlikePost(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ): Promise<PostLikeResponseDto> {
    return this.postLikesService.unlikePost(id, req.user.id);
  }

  @Get(':id/liked')
  async checkIfLiked(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isLiked = await this.postLikesService.checkIfUserLikedPost(id, req.user.id);
    return { isLiked };
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Response } from 'express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // File upload endpoint: This endpoint expects images and/or a thumbnail.
  @Public()
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async uploadFiles(
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    return this.postsService.uploadFiles(files);
  }

  // Create a new post (JSON only, images handled via /upload)
  @Public()
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  // Get all posts
  @Public()
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  // Get a single post by ID
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Public()
  @Get('uploads/:filename')
  async getUploadedFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.postsService.getUploadedFile(filename, res);
  }

  @Public()
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files?: {
      images?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    return this.postsService.update(+id, updatePostDto, files);
  }

  // Delete a post by ID
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}

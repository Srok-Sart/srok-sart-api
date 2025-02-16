import { 
  Controller, 
  Post, 
  Get,
  UseInterceptors, 
  UploadedFiles,
  Param,
  Res,
  NotFoundException
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadService } from './file-upload.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async uploadFiles(@UploadedFiles() files: { 
    images?: Express.Multer.File[]; 
    thumbnail?: Express.Multer.File[] 
  }) {
    return this.uploadService.uploadFiles(files);
  }

  @Public()
  @Get(':filename')
  async getUploadedFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    return res.sendFile(filePath);
  }
}
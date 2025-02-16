import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './file-upload.controller';
import { UploadService } from './file-upload.service';
import { multerConfig } from '../../multer.config';

@Module({
  imports: [
    MulterModule.register(multerConfig),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
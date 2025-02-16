import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadService {
  uploadFiles(files: { images?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] }) {
    console.log('Files received (upload service):', files);

    const images = files?.images || [];
    const thumbnailFiles = files?.thumbnail || [];

    if (images.length === 0 && thumbnailFiles.length === 0) {
      throw new BadRequestException('At least one image or thumbnail should be uploaded');
    }

    const imageUrls = images.map((file) => `/uploads/${file.filename}`);
    const thumbnailUrl = thumbnailFiles.length > 0 ? `/uploads/${thumbnailFiles[0].filename}` : null;

    return { imageUrls, thumbnailUrl };
  }

  getUploadPath(filename: string): string {
    return `uploads/${filename}`;
  }
}
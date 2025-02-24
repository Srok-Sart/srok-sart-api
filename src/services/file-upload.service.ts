import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  private uploadDir = join(process.cwd(), 'uploads');

  async saveFile(file: Express.Multer.File): Promise<string> {
    console.log('Received file:', file);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.buffer) {
      console.error('File received, but buffer is missing:', file);
      throw new BadRequestException(
        'File buffer is missing, ensure Multer is using memoryStorage()',
      );
    }

    const filePath = join(this.uploadDir, file.originalname);

    // Ensure directory exists
    await mkdir(this.uploadDir, { recursive: true });

    // Save the file using Buffer
    await writeFile(filePath, file.buffer);

    console.log(`File successfully saved: ${filePath}`);

    return `/uploads/${file.originalname}`;
  }

  async saveMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.saveFile(file)));
  }
}

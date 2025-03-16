import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { constants } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private uploadDir = join(process.cwd(), 'uploads');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
  ];
  private readonly allowedVideoTypes = [
    '.mp4',
    '.webm',
    '.ogg',
    '.mov',
    '.mkv',
    '.avi',
  ];

  /**
   * Validates a file for existence, buffer content, file size, and file type
   * @param file The file to validate
   * @throws BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException
   */
  private validateFile(file: Express.Multer.File): void {
    // Check if file exists
    if (!file) {
      this.logger.error('No file provided for upload');
      throw new BadRequestException('No file uploaded');
    }

    // Check if buffer exists
    if (!file.buffer || file.buffer.length === 0) {
      this.logger.error(
        `File buffer is missing or empty for file: ${file.originalname}`,
      );
      throw new BadRequestException(
        'File buffer is missing or empty, ensure Multer is using memoryStorage()',
      );
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.logger.warn(
        `File size exceeds limit: ${file.originalname} (${file.size} bytes)`,
      );
      throw new PayloadTooLargeException(
        `File size exceeds the limit of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Check file type
    const fileExt = extname(file.originalname).toLowerCase();
    const isImage = this.allowedImageTypes.includes(fileExt);
    const isVideo = this.allowedVideoTypes.includes(fileExt);
    
    // Accept both image and video types
    if (!isImage && !isVideo) {
      this.logger.warn(
        `Unsupported file type: ${fileExt} for file ${file.originalname}`,
      );
      throw new UnsupportedMediaTypeException(
        `File type ${fileExt} is not supported. Allowed types: ${[
          ...this.allowedImageTypes, 
          ...this.allowedVideoTypes
        ].join(', ')}`,
      );
    }
  }

  /**
   * Saves an uploaded file to the local filesystem
   * @param file The file to save
   * @returns The file path
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    this.logger.log(
      `Processing file upload: ${file?.originalname || 'unnamed file'}`,
    );

    try {
      // Validate the file
      this.validateFile(file);

      // Generate a unique filename to prevent overwriting
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.originalname}`;
      const filePath = join(this.uploadDir, uniqueFilename);

      // Ensure upload directory exists
      await mkdir(this.uploadDir, { recursive: true });

      // Check if directory is writable
      try {
        await access(this.uploadDir, constants.W_OK);
      } catch (error) {
        this.logger.error(
          `Upload directory is not writable: ${this.uploadDir}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'Server storage is not configured properly',
        );
      }

      // Save the file using Buffer
      await writeFile(filePath, file.buffer);

      this.logger.log(`File successfully saved: ${filePath}`);

      return `/uploads/${uniqueFilename}`;
    } catch (error) {
      // Log the full error for debugging
      this.logger.error(
        `Failed to save file: ${file?.originalname || 'unnamed file'}`,
        error.stack,
      );

      // Re-throw NestJS exceptions as-is, or wrap other errors
      if (
        error instanceof BadRequestException ||
        error instanceof PayloadTooLargeException ||
        error instanceof UnsupportedMediaTypeException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to save the uploaded file',
      );
    }
  }

  /**
   * Saves multiple uploaded files to the local filesystem
   * @param files Array of files to save
   * @returns Array of file paths
   */
  async saveMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    this.logger.log(
      `Processing multiple file upload: ${files?.length || 0} files`,
    );

    if (!files || files.length === 0) {
      this.logger.warn('No files were provided for multiple file upload');
      throw new BadRequestException('No files uploaded');
    }

    try {
      const results = await Promise.all(
        files.map(async (file, index) => {
          try {
            return await this.saveFile(file);
          } catch (error) {
            this.logger.error(
              `Failed to save file at index ${index}`,
              error.stack,
            );
            throw error;
          }
        }),
      );

      this.logger.log(`Successfully saved ${results.length} files`);
      return results;
    } catch (error) {
      this.logger.error('Failed to save multiple files', error.stack);
      throw error;
    }
  }
}
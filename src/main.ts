import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(); // Enable CORS
  const PORT = process.env.PORT ?? 3000;

  // Serve static files from the 'uploads' folder.
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(PORT);
}

bootstrap();

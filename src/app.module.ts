import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from 'db.config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { CommentsModule } from './comments/comments.module';
import { MaterialsModule } from './materials/materials.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { MaterialTrackingModule } from './material-tracking/material-tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    MaterialsModule,
    CommentsModule,
    BookmarksModule,
    MaterialTrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

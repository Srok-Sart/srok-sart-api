import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from 'src/services/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([User],)],
  controllers: [UsersController],
  providers: [UsersService, FileUploadService,],
})
export class UsersModule {}

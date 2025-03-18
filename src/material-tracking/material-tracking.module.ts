import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCompletion } from 'src/posts/entities/post-completion.entity';
import { PostMaterial } from 'src/posts/entities/post-material.entity';
import { User } from 'src/users/entities/user.entity';
import { MaterialTrackingController } from './material-tracking.controller';
import { MaterialTrackingService } from './material-tracking.service';
import { UserMaterialTrackingService } from './user-material-tracking.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostMaterial, PostCompletion, User])],
  controllers: [MaterialTrackingController],
  providers: [MaterialTrackingService, UserMaterialTrackingService],
})
export class MaterialTrackingModule {}

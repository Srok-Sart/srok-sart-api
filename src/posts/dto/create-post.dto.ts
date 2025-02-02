import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostType } from '../enums/post-type.enum';
import { PostDifficulty } from '../enums/post-difficulty.enum';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  estimatedTime: string;

  @IsString()
  @IsNotEmpty()
  thumbnailUrl: string;

  @IsEnum(PostType)
  postType: PostType;

  @IsEnum(PostDifficulty)
  postDifficulty: PostDifficulty;
}

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { PostType } from '../enums/post-type.enum';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { PostStatus } from '../enums/post-status.enum';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  estimatedTime?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsEnum(PostType)
  postType: PostType;

  @IsEnum(PostDifficulty)
  postDifficulty: PostDifficulty;

  @IsOptional()
  @IsEnum(PostStatus)
  postStatus: PostStatus;

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  materialIds: number[];
}

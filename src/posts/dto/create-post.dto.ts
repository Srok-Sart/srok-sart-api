import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { PostStatus } from '../enums/post-status.enum';
import { PostType } from '../enums/post-type.enum';

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
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  })
  @Type(() => MaterialData)
  materials: MaterialData[];
}

class MaterialData {
  @IsInt()
  materialId: number;

  @IsNumber()
  @IsOptional()
  quantityRequired?: number;
}

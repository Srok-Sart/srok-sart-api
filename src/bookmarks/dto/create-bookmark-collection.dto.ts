import { IsOptional, IsString } from 'class-validator';

export class CreateBookmarkCollectionDto {
  @IsString()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  isPrivate?: boolean;
}

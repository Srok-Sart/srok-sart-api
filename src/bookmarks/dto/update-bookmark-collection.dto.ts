import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateBookmarkCollectionDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsBoolean()
  readonly isPrivate?: boolean;
}
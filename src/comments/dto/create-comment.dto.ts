import { IsString, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(255)
  content: string;

  @IsInt()
  @IsPositive()
  postId: number;
}

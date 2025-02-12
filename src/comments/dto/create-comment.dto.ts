import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  content: string;

  @IsNotEmpty()
  postId: number;
}

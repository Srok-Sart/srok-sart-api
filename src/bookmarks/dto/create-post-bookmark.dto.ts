import { IsNotEmpty } from 'class-validator';

export class CreatePostBookmarkDto {
  @IsNotEmpty()
  collectionId: number;

  @IsNotEmpty()
  postId: number;
}

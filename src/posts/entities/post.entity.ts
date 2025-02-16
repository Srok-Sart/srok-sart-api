import { Column, Entity, OneToMany } from 'typeorm';
import { PostType } from '../enums/post-type.enum';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { Base } from 'src/core/base.entity';
import { PostBookmark } from '../../bookmarks/entities/post-bookmark.entity';

@Entity('posts')
export class Post extends Base {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  estimatedTime: string;

  @Column('text', { array: true, default: [] })
  imageUrls: string[];

  @Column()
  thumbnailUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'enum', enum: PostType, default: PostType.IMAGE })
  postType: PostType;

  @Column({
    type: 'enum',
    enum: PostDifficulty,
    default: PostDifficulty.EASY,
    nullable: true,
  })
  postDifficulty: PostDifficulty;
}

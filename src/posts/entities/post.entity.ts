import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostType } from '../enums/post-type.enum';
import { PostDifficulty } from '../enums/post-difficulty.enum';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  estimatedTime: string;

  @Column()
  thumbnailUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'enum', enum: PostType, default: PostType.YOUTUBE_URL })
  postType: PostType;

  @Column({
    type: 'enum',
    enum: PostDifficulty,
    default: PostDifficulty.EASY,
    nullable: true,
  })
  postDifficulty: PostDifficulty;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}

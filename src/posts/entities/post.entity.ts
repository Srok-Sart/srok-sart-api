import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PostType } from '../enums/post-type.enum';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { Base } from 'src/core/base.entity';
import { PostStatus } from '../enums/post-status.enum';
import { PostLike } from './post-like.entity';
import { User } from '../../users/entities/user.entity';

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

  @OneToMany(() => PostLike, like => like.post)
  likes: PostLike[];

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @Column({ type: 'enum', enum: PostType, default: PostType.IMAGE })
  postType: PostType;

  @Column({
    type: 'enum',
    enum: PostDifficulty,
    default: PostDifficulty.EASY,
    nullable: true,
  })
  postDifficulty: PostDifficulty;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PENDING,
    nullable: true,
  })
  postStatus: PostStatus;
}
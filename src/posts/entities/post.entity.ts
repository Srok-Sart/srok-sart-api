import { Base } from 'src/core/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { PostStatus } from '../enums/post-status.enum';
import { PostType } from '../enums/post-type.enum';
import { PostCompletion } from './post-completion.entity';
import { PostLike } from './post-like.entity';
import { PostMaterial } from './post-material.entity';

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

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @ManyToOne(() => User, (user) => user.posts)
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

  @OneToMany(() => PostCompletion, (postCompletion) => postCompletion.post)
  completions: PostCompletion[];

  @OneToMany(() => PostMaterial, (postMaterial) => postMaterial.post, {
    cascade: true,
  })
  postMaterials: PostMaterial[];
  totalWeight: number;
}

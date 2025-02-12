import { Base } from 'src/core/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { PostDifficulty } from '../enums/post-difficulty.enum';
import { PostStatus } from '../enums/post-status.enum';
import { PostType } from '../enums/post-type.enum';
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

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PENDING,
    nullable: true,
  })
  postStatus: PostStatus;

  @OneToMany(() => PostMaterial, (postMaterial) => postMaterial.post)
  materials: PostMaterial[];
}

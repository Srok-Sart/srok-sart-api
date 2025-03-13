import { Base } from 'src/core/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_completions')
export class PostCompletion extends Base {
  @ManyToOne(() => Post, (post) => post.completions)
  post: Post;

  @ManyToOne(() => User, (user) => user.completions)
  user: User;

  @Column({ nullable: true })
  completedAt: Date;
}

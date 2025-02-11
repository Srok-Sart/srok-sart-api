import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/core/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity('comments')
export class Comment extends Base {

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @Column({ name: 'post_id' })
    postId: number;
}
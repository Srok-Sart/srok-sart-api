import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostBookmark } from './post-bookmark.entity';
import { Base } from 'src/core/base.entity';

@Entity('bookmark_collections')
export class BookmarkCollection extends Base {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isPrivate: boolean;

  @ManyToOne(() => User, (user) => user.collections)
  _user: User;

  @OneToMany(() => PostBookmark, (postBookmark) => postBookmark.collection)
  postBookmarks: PostBookmark[];
}

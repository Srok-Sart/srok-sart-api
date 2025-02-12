import { Base } from 'src/core/base.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BookmarkCollection } from './bookmark-collection.entity';

@Entity('post_bookmark')
export class PostBookmark extends Base {
  @ManyToOne(() => BookmarkCollection, (collection) => collection.postBookmarks)
  collection: BookmarkCollection;

  @ManyToOne(() => Post)
  post: Post;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}

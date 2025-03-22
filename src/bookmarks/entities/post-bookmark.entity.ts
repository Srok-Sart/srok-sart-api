import { Entity, ManyToOne, Column } from 'typeorm';
import { BookmarkCollection } from './bookmark-collection.entity';
import { Base } from 'src/core/base.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity('post_bookmarks')
export class PostBookmark extends Base {
  @ManyToOne(() => BookmarkCollection, (collection) => collection.postBookmarks)
  collection: BookmarkCollection;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { BookmarkCollection } from './bookmark-collection.entity';
import { Base } from 'src/core/base.entity';

@Entity('post_bookmarks')
export class PostBookmark extends Base {
  @ManyToOne(() => BookmarkCollection, (collection) => collection.postBookmarks, {
    eager: true,
  })
  collection: BookmarkCollection;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
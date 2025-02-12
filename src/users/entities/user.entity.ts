import * as argon2 from 'argon2';
import { Exclude } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';
import { PostCompletion } from 'src/posts/entities/post-completion.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookmarkCollection } from '../../bookmarks/entities/bookmark-collection.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, type: 'varchar', length: 40 })
  email: string;

  @Exclude()
  @Column({ name: 'password' })
  password: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(
    () => BookmarkCollection,
    (bookmarkCollection) => bookmarkCollection._user,
    { eager: true },
  )
  collections: BookmarkCollection[];

  @OneToMany(() => PostCompletion, (postCompletion) => postCompletion.post)
  completions: PostCompletion[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
    console.log(this.password);
  }
}

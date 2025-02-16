import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Role } from 'src/auth/enums/role.enum';
import { Exclude } from 'class-transformer';
import { BookmarkCollection } from '../../bookmarks/entities/bookmark-collection.entity';

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

  @Column({ name: 'password' })
  _password: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Exclude()
  @Column({ nullable: true })
  hashedRefreshToken: string;

  @OneToMany(
    () => BookmarkCollection,
    (bookmarkCollection) => bookmarkCollection._user,
    { eager: true },
  )
  collections: BookmarkCollection[];

  @BeforeInsert()
  async hashPassword() {
    this._password = await argon2.hash(this._password);
  }
}

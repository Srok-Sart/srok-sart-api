import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    username: string;
  
    @Column()
    password: string;
  
    @Column({ nullable: true })
    profile_picture: string;
  
    @Column({ nullable: true })
    bio: string;
  
    @Column({
      type: 'enum',
      enum: UserRole,
      default: UserRole.USER,
    })
    role: UserRole;
}

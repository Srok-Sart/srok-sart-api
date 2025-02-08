import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private excludePassword(user: User): Partial<User> {
    const { password, ...result } = user;
    return result;
  }

  async create(user: Partial<User>): Promise<Partial<User>> {
    user.password = bcrypt.hashSync(user.password, 8); 
    const createdUser = await this.usersRepository.save(user);
    return this.excludePassword(createdUser);
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.excludePassword(user)); 
  }

  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return this.excludePassword(user);
  }

  async findOneByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: number, user: Partial<User>): Promise<Partial<User>> {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password, 8); 
    }
    await this.usersRepository.update(id, user);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    return this.excludePassword(updatedUser); 
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
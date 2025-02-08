import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepo.create(createUserDto);
    try {
      return await this.usersRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create user. ${error.message}`,
      );
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepo.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
    });
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepo.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'hashedRefreshToken',
        'role',
      ],
    });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { email },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    try {
      return await this.usersRepo.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user with ID ${id}. ${error.message}`,
      );
    }
  }

  async updateRefreshToken(id: number, hashedRefreshToken: string) {
    return this.usersRepo.update(id, { hashedRefreshToken });
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      await this.usersRepo.remove(user);
      return { message: `User with ID ${id} successfully deleted` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete user with ID ${id}. ${error.message}`,
      );
    }
  }
}

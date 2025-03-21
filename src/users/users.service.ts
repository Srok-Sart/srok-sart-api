import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    // Set default profile image if not provided
    if (!createUserDto.profileImageUrl) {
      createUserDto.profileImageUrl =
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/person-fill.svg';
    }

    // Check if a user with the same email or username already exists
    const existingUser = await this.usersRepo.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists.');
    }

    const user = this.usersRepo.create(createUserDto);

    return await this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepo.findOneBy({ id });
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
    if (!id) {
      throw new InternalServerErrorException('User ID is required');
    }

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

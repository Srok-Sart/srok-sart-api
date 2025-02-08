import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
  } 
  from '@nestjs/common';
  import { UsersService } from './users.service';
  import { User } from './entities/user.entity';
  import * as bcrypt from 'bcryptjs';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post('signup')
    async signup(@Body() user: User): Promise<Partial<User>> {
      return this.usersService.create(user);
    }
  
    @Post('login')
    async login(@Body() user: { username: string; password: string }) {
      const foundUser = await this.usersService.findOneByUsername(user.username);
      if (foundUser && bcrypt.compareSync(user.password, foundUser.password)) {
        const { password, ...result } = foundUser;
        return result; 
      }
      return { message: 'Invalid credentials' };
    }
  
    @Post()
    async create(@Body() user: User): Promise<Partial<User>> {
      return this.usersService.create(user);
    }
  
    @Get()
    async findAll(): Promise<Partial<User>[]> {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Partial<User>> {
      return this.usersService.findOne(+id);
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() user: User): Promise<Partial<User>> {
      return this.usersService.update(+id, user);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
      return this.usersService.remove(+id);
    }
  }
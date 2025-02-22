import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfig,
  ) {}

  async login(user: User) {
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    await this.hashAndSaveRefreshToken(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: number) {
    return this.usersService.updateRefreshToken(userId, null);
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        payload,
        this.refreshJwtConfig as ConfigType<typeof refreshJwtConfig>,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      payload,
      this.refreshJwtConfig as ConfigType<typeof refreshJwtConfig>,
    );

    await this.hashAndSaveRefreshToken(userId, refreshToken);

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  private async hashAndSaveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  async validateUser(email: string, plainPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password. Please try again.',
      );
    }

    const isPasswordValid = await argon2.verify(user.password, plainPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password. Please try again.',
      );
    }

    return user;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      const newUser = await this.usersService.create(googleUser);

      return newUser;
    }

    return user;
  }

  async validateRefreshToken(payload: AuthJwtPayload, refreshToken: string) {
    try {
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Invalid Refresh Token');
      }

      const isRefreshTokenValid = await argon2.verify(
        user.hashedRefreshToken,
        refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid Refresh Token');
      }

      return user.id;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async validateJwtUser(payload: AuthJwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}

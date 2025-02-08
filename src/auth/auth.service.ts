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
import { CurrentUser } from './types/current-user';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfig,
  ) {}

  async login(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    return {
      id: userId,
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

  async refreshToken(user: AuthJwtPayload) {
    const payload: AuthJwtPayload = { sub: user.sub };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      payload,
      this.refreshJwtConfig as ConfigType<typeof refreshJwtConfig>,
    );

    return {
      id: user.sub,
      accessToken,
      refreshToken,
    };
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

    const result = omit(user, ['password']);

    return result;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    try {
      const user = await this.usersService.findOne(userId);

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

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentUser: CurrentUser = { ...user };

    return currentUser;
  }

  async getProfile(userId: number): Promise<CurrentUser> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const result = omit(user, ['password', 'hashedRefreshToken']);

    return result as CurrentUser;
  }
}

import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UsersService,
  ) {}

  @Public()
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const payload = await this.authService.login(req.user.id);

    return payload;
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    const refreshToken = await this.authService.refreshToken(req.user);

    return refreshToken;
  }

  @HttpCode(204)
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user.id;
    return this.authService.getProfile(userId);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);

    // res.redirect(`${process.env.CLIENT_ORIGIN}?token=${response.accessToken}`);
    res.redirect(`http://localhost:8000?token=${response.accessToken}`);
  }
}

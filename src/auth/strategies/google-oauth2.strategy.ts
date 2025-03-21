import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import GoogleOauth2Config from '../config/google-oauth2.config';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class GoogleOauth2Strategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(GoogleOauth2Config.KEY)
    googleOauth2Config: ConfigType<typeof GoogleOauth2Config>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleOauth2Config.clientID,
      clientSecret: googleOauth2Config.clientSecret,
      callbackURL: googleOauth2Config.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifiedCallback,
  ): Promise<any> {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profileImageUrl: profile.photos[0].value,
      password: '',
      username: profile.emails[0].value,
      bio: '',
      role: Role.USER,
    });

    done(null, user);
  }
}

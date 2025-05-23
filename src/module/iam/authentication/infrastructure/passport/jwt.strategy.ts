import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

import { ENVIRONMENT } from '@config/environment.enum';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

import { IAccessTokenPayload } from '@module/iam/authentication/infrastructure/passport/access-token-payload.interface';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@module/iam/user/application/repository/user.repository.interface';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
  ) {
    /* istanbul ignore next */
    const options: StrategyOptionsWithRequest =
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? ({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_AUTOMATED_TESTS_SECRET,
          } as StrategyOptionsWithRequest)
        : ({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            issuer: configService.get<string>('cognito.issuer'),
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
              cache: true,
              rateLimit: true,
              jwksRequestsPerMinute: 5,
              jwksUri:
                configService.get('cognito.issuer') + '/.well-known/jwks.json',
            }),
          } as StrategyOptionsWithRequest);

    super(options);
  }

  async validate(accessTokenPayload: IAccessTokenPayload): Promise<User> {
    const currentUser = await this.userRepository.getOneByExternalId(
      accessTokenPayload.sub,
    );

    if (!currentUser) {
      throw new ForbiddenException();
    }

    return currentUser;
  }
}

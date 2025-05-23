import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TOKEN_EXPIRED_ERROR } from '@module/iam/authentication/application/exception/authentication-exception-messages';
import { TokenExpiredException } from '@module/iam/authentication/application/exception/token-expired.exception';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser,
    info: null | Error,
  ): TUser {
    if (info?.name === 'TokenExpiredError')
      throw new TokenExpiredException(TOKEN_EXPIRED_ERROR);
    else if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}

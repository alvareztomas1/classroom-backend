import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { AuthType } from '@module/iam/authentication/domain/auth-type.enum';

export const AUTH_TYPE_KEY = 'AUTH_TYPE';

export const Auth = (...authTypes: AuthType[]): CustomDecorator<string> =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);

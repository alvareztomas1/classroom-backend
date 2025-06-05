import { Request } from 'express';

import { REQUEST_USER_KEY } from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@module/iam/user/domain/user.entity';

export class BasePolicyHandler {
  protected getCurrentUser(request: Request): User {
    return request[REQUEST_USER_KEY] as User;
  }
}

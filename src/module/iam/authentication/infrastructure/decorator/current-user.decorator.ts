import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

import { User } from '@module/iam/user/domain/user.entity';

export const REQUEST_USER_KEY = 'user';

export const CurrentUser = createParamDecorator(
  (field: keyof User, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY];

    return field ? (user as User)?.[field] : user;
  },
);

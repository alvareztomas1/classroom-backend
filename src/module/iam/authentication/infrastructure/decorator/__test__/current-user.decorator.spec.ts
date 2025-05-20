import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Request } from 'express';

import {
  CurrentUser,
  REQUEST_USER_KEY,
} from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@module/iam/user/domain/user.entity';

describe('@CurrentUser', () => {
  const user = {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'test_john@email.co',
  } as User;

  const request = {
    [REQUEST_USER_KEY]: user,
  } as Request & { user?: User };

  const executionContext = {
    switchToHttp: () => ({
      getRequest: (): Request => request,
    }),
  } as ExecutionContext;

  it('Should get the current user of the request', () => {
    class Test {
      test(
        @CurrentUser()
        user: User,
      ): User {
        return user;
      }
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      Test,
      'test',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as Record<string, any>;
    const key = Object.keys(metadata)[0];
    const currentUserFactory = (
      metadata[key] as {
        factory: (
          fields: keyof User | undefined,
          ctx: ExecutionContext,
        ) => User;
      }
    ).factory;
    const result = currentUserFactory(undefined, executionContext);
    expect(result).toEqual(request.user);
  });

  it('Should get the field requested of the current user', () => {
    class Test {
      test(
        @CurrentUser('id')
        id: string,
      ): string {
        return id;
      }
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      Test,
      'test',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as Record<string, any>;
    const key = Object.keys(metadata)[0];
    const currentUserFactory = (
      metadata[key] as {
        factory: (
          fields: keyof User | undefined,
          ctx: ExecutionContext,
        ) => User;
      }
    ).factory;
    const result = currentUserFactory('id', executionContext);

    expect(result).toEqual(request.user.id);
  });
});

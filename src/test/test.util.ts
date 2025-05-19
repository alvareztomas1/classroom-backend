import * as jwt from 'jsonwebtoken';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

import { IAccessTokenPayload } from '@module/iam/authentication/infrastructure/passport/access-token-payload.interface';

export const createAccessToken = (
  payload: Partial<IAccessTokenPayload>,
  options?: jwt.SignOptions,
): string => {
  return jwt.sign(payload, JWT_AUTOMATED_TESTS_SECRET, options);
};

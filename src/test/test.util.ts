import * as jwt from 'jsonwebtoken';
import { Readable } from 'stream';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

import { IAccessTokenPayload } from '@module/iam/authentication/infrastructure/passport/access-token-payload.interface';

export const createAccessToken = (
  payload: Partial<IAccessTokenPayload>,
  options?: jwt.SignOptions,
): string => {
  return jwt.sign(payload, JWT_AUTOMATED_TESTS_SECRET, options);
};

export const mockJpgFile: Express.Multer.File = {
  fieldname: 'avatar',
  originalname: 'profile.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024 * 150,
  buffer: Buffer.from('fake-image-binary-data'),
  destination: '/tmp/uploads',
  filename: 'profile-123.jpg',
  path: '/tmp/uploads/profile-123.jpg',
  stream: new Readable(),
};

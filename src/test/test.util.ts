import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as os from 'os';
import * as path from 'path';
import { Readable } from 'stream';

import { IAccessTokenPayload } from '@module/iam/authentication/infrastructure/passport/access-token-payload.interface';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

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

export function createLargeMockFile(
  fileName: string,
  sizeInMB: number,
): string {
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const sizeInBytes = sizeInMB * 1024 * 1024;
  fs.writeFileSync(tempFilePath, Buffer.alloc(sizeInBytes, 0));
  return tempFilePath;
}

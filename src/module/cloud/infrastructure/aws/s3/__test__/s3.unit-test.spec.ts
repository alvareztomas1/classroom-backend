import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { InternalServerErrorException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';

import { setupApp } from '@config/app.config';

import { FILE_STORAGE_PROVIDER_SERVICE_KEY } from '@cloud/application/interface/file-storage-provider.interface';
import { AmazonS3Service } from '@cloud/infrastructure/aws/s3/s3.service';

import { AppModule } from '@module/app.module';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  PutObjectCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  DeleteObjectCommand: jest.fn((input) => input),
  S3Client: jest.fn().mockImplementation(() => ({
    send: sendMock,
  })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test-video.mp4',
  encoding: '7bit',
  mimetype: 'video/mp4',
  buffer: Buffer.from('fake-video-data'),
  size: 1024,
  destination: '',
  filename: '',
  path: '',
  stream: new Readable(),
};

describe('AmazonS3Service', () => {
  let app: NestExpressApplication;
  let amazonS3Service: AmazonS3Service;

  beforeAll(() => {
    process.env.AWS_ACCESS_KEY_ID = 'mock-access-key-id';
    process.env.AWS_SECRET_ACCESS_KEY = 'mock-secret-access-key';
    process.env.AWS_REGION = 'mock-region';
    process.env.S3_BUCKET = 'mock-bucket';
    process.env.AWS_ENDPOINT = 'mock-endpoint';
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);

    amazonS3Service = moduleRef.get<AmazonS3Service>(
      FILE_STORAGE_PROVIDER_SERVICE_KEY,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should define the AmazonS3Service with the correct configuration', () => {
    expect(amazonS3Service).toBeDefined();
    expect(S3Client).toHaveBeenCalledTimes(1);
    expect(S3Client).toHaveBeenCalledWith({
      region: 'mock-region',
      endpoint: 'mock-endpoint',
      credentials: {
        accessKeyId: 'mock-access-key-id',
        secretAccessKey: 'mock-secret-access-key',
      },
      forcePathStyle: true,
    });
  });

  describe('uploadFile', () => {
    it('Should upload a file to S3', async () => {
      const url = await amazonS3Service.uploadFile(mockFile, 'folder');
      const command = {
        Bucket: 'mock-bucket',
        Key: 'folder/mock-uuid.mp4',
        Body: mockFile.buffer,
        ACL: 'public-read',
        ContentType: 'video/mp4',
      };
      expect(PutObjectCommand).toHaveBeenCalledTimes(1);
      expect(PutObjectCommand).toHaveBeenCalledWith(command);

      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith(command);
      expect(url).toBe('mock-endpoint/mock-bucket/folder/mock-uuid.mp4');
    });
  });

  describe('deleteFile', () => {
    it('Should delete a file from S3', async () => {
      const command = {
        Bucket: 'mock-bucket',
        Key: 'folder/test-video.mp4',
      };

      await amazonS3Service.deleteFile(
        'mock-endpoint/mock-bucket/folder/test-video.mp4',
      );

      expect(DeleteObjectCommand).toHaveBeenCalledTimes(1);
      expect(DeleteObjectCommand).toHaveBeenCalledWith(command);
      expect(sendMock).toHaveBeenCalledTimes(1);
      expect(sendMock).toHaveBeenCalledWith(command);
    });

    it('Should throw an InternalServerErrorException when receiving an invalid S3 URL', async () => {
      const invalidUrl = 'invalid-url';

      await expect(amazonS3Service.deleteFile(invalidUrl)).rejects.toThrow(
        new InternalServerErrorException('Invalid S3 URL format'),
      );
    });
  });
});

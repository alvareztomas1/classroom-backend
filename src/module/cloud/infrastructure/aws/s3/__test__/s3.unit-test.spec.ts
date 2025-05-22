import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import { setupApp } from '@config/app.config';

import { AppModule } from '@module/app.module';
import { IMAGE_STORAGE_PROVIDER_SERVICE_KEY } from '@module/cloud/application/interface/image-storage-provider.interface';
import { AmazonS3Service } from '@module/cloud/infrastructure/aws/s3/s3.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  PutObjectCommand: jest.fn((input) => input),
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
  stream: null,
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
      IMAGE_STORAGE_PROVIDER_SERVICE_KEY,
    );
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

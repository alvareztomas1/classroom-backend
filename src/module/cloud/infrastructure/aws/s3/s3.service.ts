import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { IFileStorageProvider } from '@module/cloud/application/interface/file-storage-provider.interface';

@Injectable()
export class AmazonS3Service implements IFileStorageProvider {
  s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('aws.region'),
      endpoint: this.configService.get('aws.endpoint'),
      credentials: {
        accessKeyId: this.configService.get('aws.credentials.accessKeyId'),
        secretAccessKey: this.configService.get(
          'aws.credentials.secretAccessKey',
        ),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const id = uuidv4();
    const positionSlash = file.mimetype.indexOf('/') + 1;
    const key = `${id}.${file.mimetype.slice(positionSlash)}`;
    const command = new PutObjectCommand({
      Bucket: this.configService.get('s3.bucket'),
      Key: `${folder}/${key}`,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return `${this.configService.get('aws.endpoint')}/${this.configService.get('S3_BUCKET')}/${folder}/${key}`;
  }
}

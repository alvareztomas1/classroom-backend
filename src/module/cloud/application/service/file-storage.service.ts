import { Inject, Injectable } from '@nestjs/common';

import {
  FILE_STORAGE_PROVIDER_SERVICE_KEY,
  IFileStorageProvider,
} from '@module/cloud/application/interface/file-storage-provider.interface';

@Injectable()
export class FileStorageService {
  constructor(
    @Inject(FILE_STORAGE_PROVIDER_SERVICE_KEY)
    private readonly fileStorageProvider: IFileStorageProvider,
  ) {}

  uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return this.fileStorageProvider.uploadFile(file, folder);
  }
}

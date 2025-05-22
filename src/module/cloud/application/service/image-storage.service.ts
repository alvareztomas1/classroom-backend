import { Inject, Injectable } from '@nestjs/common';

import {
  IImageStorageProvider,
  IMAGE_STORAGE_PROVIDER_SERVICE_KEY,
} from '@module/cloud/application/interface/image-storage-provider.interface';

@Injectable()
export class ImageStorageService {
  constructor(
    @Inject(IMAGE_STORAGE_PROVIDER_SERVICE_KEY)
    private readonly imageStorageProvider: IImageStorageProvider,
  ) {}

  uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return this.imageStorageProvider.uploadFile(file, folder);
  }
}

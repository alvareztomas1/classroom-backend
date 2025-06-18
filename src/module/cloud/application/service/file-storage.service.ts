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

  public USERS_FOLDER = 'users';
  public AVATARS_FOLDER = 'avatars';
  public COURSES_FOLDER = 'courses';
  public SECTION_FOLDER = 'sections';
  public IMAGES_FOLDER = 'images';

  uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return this.fileStorageProvider.uploadFile(file, folder);
  }

  deleteFile(fileUrl: string): Promise<void> {
    return this.fileStorageProvider.deleteFile(fileUrl);
  }
}

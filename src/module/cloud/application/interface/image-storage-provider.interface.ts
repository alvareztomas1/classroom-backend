export const IMAGE_STORAGE_PROVIDER_SERVICE_KEY =
  'image_storage_provider_service';

export interface IImageStorageProvider {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
}

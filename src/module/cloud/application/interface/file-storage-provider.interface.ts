export const FILE_STORAGE_PROVIDER_SERVICE_KEY =
  'file_storage_provider_service';

export interface IFileStorageProvider {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

import { Global, Module, Provider } from '@nestjs/common';

import { FILE_STORAGE_PROVIDER_SERVICE_KEY } from '@module/cloud/application/interface/file-storage-provider.interface';
import { FileStorageService } from '@module/cloud/application/service/file-storage.service';
import { AmazonS3Service } from '@module/cloud/infrastructure/aws/s3/s3.service';

const fileStorageProvider: Provider = {
  provide: FILE_STORAGE_PROVIDER_SERVICE_KEY,
  useClass: AmazonS3Service,
};

@Global()
@Module({
  imports: [],
  providers: [fileStorageProvider, FileStorageService],
  exports: [FileStorageService],
})
export class CloudModule {}

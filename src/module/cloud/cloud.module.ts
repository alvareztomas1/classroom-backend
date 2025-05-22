import { Global, Module, Provider } from '@nestjs/common';

import { IMAGE_STORAGE_PROVIDER_SERVICE_KEY } from '@module/cloud/application/interface/image-storage-provider.interface';
import { ImageStorageService } from '@module/cloud/application/service/image-storage.service';
import { AmazonS3Service } from '@module/cloud/infrastructure/aws/s3/s3.service';

const imageStorageProvider: Provider = {
  provide: IMAGE_STORAGE_PROVIDER_SERVICE_KEY,
  useClass: AmazonS3Service,
};

@Global()
@Module({
  imports: [],
  providers: [imageStorageProvider, ImageStorageService],
  exports: [ImageStorageService],
})
export class CloudModule {}

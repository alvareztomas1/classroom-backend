import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from '@module/course/course.module';
import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { PurchaseDtoMapper } from '@module/purchase/application/mapper/purchase-dto.mapper';
import { PurchaseMapper } from '@module/purchase/application/mapper/purchase.mapper';
import { PURCHASE_REPOSITORY_KEY } from '@module/purchase/application/repository/purchase-repository.interface';
import { PURCHASE_CRUD_SERVICE_KEY } from '@module/purchase/application/service/purchase-CRUD-service.interface';
import { PurchaseCRUDService } from '@module/purchase/application/service/purchase-CRUD.service';
import { PurchaseEntity } from '@module/purchase/infrastructure/database/purchase.entity';
import { PurchasePostgresRepository } from '@module/purchase/infrastructure/database/purchase.postgres.repository';
import { PurchaseController } from '@module/purchase/interface/purchase.controller';

const purchaseRepositoryProvider: Provider = {
  provide: PURCHASE_REPOSITORY_KEY,
  useClass: PurchasePostgresRepository,
};

const purchaseCRUDServiceProvider: Provider = {
  provide: PURCHASE_CRUD_SERVICE_KEY,
  useClass: PurchaseCRUDService,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity, CourseEntity]),
    CourseModule,
  ],
  providers: [
    purchaseRepositoryProvider,
    purchaseCRUDServiceProvider,
    PurchaseMapper,
    PurchaseDtoMapper,
  ],
  controllers: [PurchaseController],
  exports: [],
})
export class PurchaseModule {}

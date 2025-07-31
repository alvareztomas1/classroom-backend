import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from '@course/course.module';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { PurchaseDtoMapper } from '@module/purchase/application/mapper/purchase-dto.mapper';
import { PurchaseMapper } from '@module/purchase/application/mapper/purchase.mapper';
import { ReadPurchasePolicyHandler } from '@module/purchase/application/policy/read-purchase-policy.handler';
import { UpdatePurchasePolicyHandler } from '@module/purchase/application/policy/update-purchase-policy.handler';
import { PURCHASE_REPOSITORY_KEY } from '@module/purchase/application/repository/purchase-repository.interface';
import { PURCHASE_CRUD_SERVICE_KEY } from '@module/purchase/application/service/purchase-CRUD-service.interface';
import { PurchaseCRUDService } from '@module/purchase/application/service/purchase-CRUD.service';
import { Purchase } from '@module/purchase/domain/purchase.entity';
import { purchasePermissions } from '@module/purchase/domain/purchase.permissions';
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

const policyHandlersProviders = [
  ReadPurchasePolicyHandler,
  UpdatePurchasePolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity, CourseEntity]),
    CourseModule,
    AuthorizationModule.forFeature(),
  ],
  providers: [
    purchaseRepositoryProvider,
    purchaseCRUDServiceProvider,
    PurchaseMapper,
    PurchaseDtoMapper,
    ...policyHandlersProviders,
  ],
  controllers: [PurchaseController],
  exports: [],
})
export class PurchaseModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Purchase, purchasePermissions);
  }
}

import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

import { CourseModule } from '@course/course.module';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { PaymentModule } from '@payment/payment.module';

import { PurchaseDtoMapper } from '@purchase/application/mapper/purchase-dto.mapper';
import { PurchaseMapper } from '@purchase/application/mapper/purchase.mapper';
import { ManagePurchasePolicyHandler } from '@purchase/application/policy/manage-purchase-policy.handler';
import { ReadPurchasePolicyHandler } from '@purchase/application/policy/read-purchase-policy.handler';
import { UpdatePurchasePaymentMethodPolicyHandler } from '@purchase/application/policy/update-purchase-payment-method.policy.handler';
import { PURCHASE_REPOSITORY_KEY } from '@purchase/application/repository/purchase-repository.interface';
import { PURCHASE_CRUD_SERVICE_KEY } from '@purchase/application/service/purchase-CRUD-service.interface';
import { PurchaseCRUDService } from '@purchase/application/service/purchase-CRUD.service';
import { Purchase } from '@purchase/domain/purchase.entity';
import { purchasePermissions } from '@purchase/domain/purchase.permissions';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';
import { PurchasePostgresRepository } from '@purchase/infrastructure/database/purchase.postgres.repository';
import { PurchaseController } from '@purchase/interface/purchase.controller';

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
  ManagePurchasePolicyHandler,
  UpdatePurchasePaymentMethodPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseEntity, CourseEntity]),
    CourseModule,
    AuthorizationModule.forFeature(),
    PaymentModule,
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

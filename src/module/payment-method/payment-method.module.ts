import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

import { PaymentMethodDtoMapper } from '@module/payment-method/application/mapper/payment-method-dto.mapper';
import { PaymentMethodMapper } from '@module/payment-method/application/mapper/payment-method.mapper';
import { CreatePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/create-payment-method-policy.handler';
import { DeletePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/delete-payment-method-policy.handler';
import { UpdatePaymentMethodPolicyHandler } from '@module/payment-method/application/policy/update-payment-method-policy.handler';
import { PAYMENT_METHOD_REPOSITORY_KEY } from '@module/payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethodCRUDService } from '@module/payment-method/application/service/payment-method-crud.service';
import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';
import { paymentMethodPermissions } from '@module/payment-method/domain/payment-method.permissions';
import { PaymentMethodEntity } from '@module/payment-method/infrastructure/database/payment-method.entity';
import { PaymentMethodPostgresRepository } from '@module/payment-method/infrastructure/database/payment-method.postgres.repository';
import { PaymentMethodController } from '@module/payment-method/interface/payment-method.controller';

const paymentMethodRepositoryProvider: Provider = {
  provide: PAYMENT_METHOD_REPOSITORY_KEY,
  useClass: PaymentMethodPostgresRepository,
};

const policyHandlersProviders = [
  CreatePaymentMethodPolicyHandler,
  UpdatePaymentMethodPolicyHandler,
  DeletePaymentMethodPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethodEntity]),
    AuthorizationModule.forFeature(),
  ],
  providers: [
    PaymentMethodCRUDService,
    PaymentMethodDtoMapper,
    PaymentMethodMapper,
    paymentMethodRepositoryProvider,
    ...policyHandlersProviders,
  ],
  controllers: [PaymentMethodController],
})
export class PaymentMethodModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(PaymentMethod, paymentMethodPermissions);
  }
}

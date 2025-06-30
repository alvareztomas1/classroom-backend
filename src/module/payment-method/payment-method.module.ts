import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentMethodMapper } from '@module/payment-method/application/mapper/payment-method.mapper';
import { PAYMENT_METHOD_REPOSITORY_KEY } from '@module/payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethodCRUDService } from '@module/payment-method/application/service/payment-method-crud.service';
import { PaymentMethodPostgresRepository } from '@module/payment-method/infrastructure/database/payment-method.postgres.repository';
import { PaymentMethodSchema } from '@module/payment-method/infrastructure/database/payment-method.schema';
import { PaymentMethodController } from '@module/payment-method/interface/payment-method.controller';

const paymentMethodRepositoryProvider: Provider = {
  provide: PAYMENT_METHOD_REPOSITORY_KEY,
  useClass: PaymentMethodPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodSchema])],
  providers: [
    PaymentMethodCRUDService,
    PaymentMethodMapper,
    paymentMethodRepositoryProvider,
  ],
  controllers: [PaymentMethodController],
})
export class PaymentMethodModule {}

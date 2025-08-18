import { Module } from '@nestjs/common';

import { PaymentService } from '@payment/application/service/payment.service';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

@Module({
  providers: [PaymentProviderStorage, PaymentService],
  exports: [PaymentProviderStorage, PaymentService],
})
export class PaymentModule {}

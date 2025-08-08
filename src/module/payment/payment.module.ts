import { Module } from '@nestjs/common';

import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

@Module({
  providers: [PaymentProviderStorage],
  exports: [PaymentProviderStorage],
})
export class PaymentModule {}

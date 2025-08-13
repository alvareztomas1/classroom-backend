import { Module } from '@nestjs/common';

import { PaymentService } from '@payment/application/service/payment.service';
import { PaypalPaymentProvider } from '@payment/infrastructure/paypal/paypal-payment.provider';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

@Module({
  providers: [PaymentProviderStorage, PaymentService, PaypalPaymentProvider],
  exports: [PaymentProviderStorage, PaymentService],
})
export class PaymentModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PaymentModule } from '@payment/payment.module';

import { PaypalPaymentProvider } from '@paypal/infrastructure/provider/paypal-payment.provider';

@Module({
  imports: [PaymentModule, HttpModule],
  providers: [PaypalPaymentProvider],
})
export class PaypalModule {}

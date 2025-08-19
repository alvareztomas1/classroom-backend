import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PaymentModule } from '@payment/payment.module';

import { PaypalWebhookService } from '@paypal/application/service/paypal-webhook.service';
import { PayPalWebhookGuard } from '@paypal/infrastructure/guard/paypal-webhook.guard';
import { PaypalPaymentProvider } from '@paypal/infrastructure/provider/paypal-payment.provider';
import { PaypalController } from '@paypal/interface/paypal.controller';

import { PurchaseModule } from '@purchase/purchase.module';

@Module({
  imports: [PaymentModule, PurchaseModule, HttpModule],
  providers: [PaypalPaymentProvider, PaypalWebhookService, PayPalWebhookGuard],
  controllers: [PaypalController],
})
export class PaypalModule {}

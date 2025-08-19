import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WebhookEventResponseDto } from '@paypal/application/dto/webhook-event-response.dto';
import { PayPalWebhookEvent } from '@paypal/application/enum/paypal-webhook-event.enum';
import {
  IPayPalCaptureResource,
  IPaypalWebhookBody,
  IPaypalWebhookVerifyPayload,
} from '@paypal/application/interface/paypal-webhook-body.interface';
import { IPayPalWebhookHeaders } from '@paypal/application/interface/paypal-webhook-headers.interface';
import { WEBHOOK_EVENT_NAME } from '@paypal/domain/webhook-name';
import { PaypalPaymentProvider } from '@paypal/infrastructure/provider/paypal-payment.provider';

import {
  IPurchaseRepository,
  PURCHASE_REPOSITORY_KEY,
} from '@purchase/application/repository/purchase-repository.interface';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

@Injectable()
export class PaypalWebhookService {
  private webhookId: string;
  constructor(
    @Inject(PURCHASE_REPOSITORY_KEY)
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly paypalPaymentProvider: PaypalPaymentProvider,
    private readonly configService: ConfigService,
  ) {
    this.webhookId = this.configService.get<string>('paypal.webhookId')!;
  }

  async verifyWebhook(
    headers: IPayPalWebhookHeaders,
    body: IPaypalWebhookBody,
  ): Promise<boolean> {
    const payload = this.buildWebhookVerifyPayload(headers, body);
    const accessToken = await this.paypalPaymentProvider.getAccessToken();

    return await this.paypalPaymentProvider.verifyWebhookSignature(
      accessToken,
      payload,
    );
  }

  private buildWebhookVerifyPayload(
    headers: IPayPalWebhookHeaders,
    body: IPaypalWebhookBody,
  ): IPaypalWebhookVerifyPayload {
    return {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: this.webhookId,
      webhook_event: body,
    };
  }

  async processEvent(
    eventType: PayPalWebhookEvent,
    resource: IPaypalWebhookBody['resource'],
  ): Promise<WebhookEventResponseDto> {
    switch (eventType) {
      case PayPalWebhookEvent.CheckoutOrderApproved:
        return await this.handleCheckoutOrderApproved(resource.id);
      case PayPalWebhookEvent.CheckoutOrderDeclined:
        return await this.handleCheckoutOrderDeclined(resource.id);
      case PayPalWebhookEvent.PaymentCaptureCompleted:
        return await this.handlePaymentCaptureCompleted(resource);
      case PayPalWebhookEvent.PaymentCaptureDenied:
        return await this.handlePaymentCaptureDenied(resource);
      case PayPalWebhookEvent.PaymentCaptureCancelled:
        return await this.handleCancelled(resource);
    }
  }

  private async handleCheckoutOrderApproved(
    orderId: string,
  ): Promise<WebhookEventResponseDto> {
    const { id } =
      await this.paypalPaymentProvider.capturePaymentOrder(orderId);

    return new WebhookEventResponseDto(
      WEBHOOK_EVENT_NAME,
      `Order with id ${id} approved`,
      true,
      PurchaseStatus.PENDING,
    );
  }

  private async handleCheckoutOrderDeclined(
    orderId: string,
  ): Promise<WebhookEventResponseDto> {
    const purchase =
      await this.purchaseRepository.findByPaymentOrderIdOrFail(orderId);

    purchase.status = PurchaseStatus.FAILED;

    await this.purchaseRepository.saveOne(purchase);

    return new WebhookEventResponseDto(
      WEBHOOK_EVENT_NAME,
      `Order with id ${orderId} declined`,
      true,
      PurchaseStatus.FAILED,
    );
  }

  private async handlePaymentCaptureCompleted(
    resource: IPayPalCaptureResource,
  ): Promise<WebhookEventResponseDto> {
    const paymentOrderId = resource.supplementary_data?.related_ids
      ?.order_id as string;
    const captureId = resource.id;
    const purchase =
      await this.purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);

    purchase.paymentTransactionId = captureId;
    purchase.status = PurchaseStatus.COMPLETED;

    await this.purchaseRepository.saveOne(purchase);

    return new WebhookEventResponseDto(
      WEBHOOK_EVENT_NAME,
      `Order with id ${paymentOrderId} captured successfully with id ${captureId}`,
      true,
      PurchaseStatus.COMPLETED,
    );
  }

  private async handlePaymentCaptureDenied(
    resource: IPayPalCaptureResource,
  ): Promise<WebhookEventResponseDto> {
    const captureId = resource.id;
    const paymentOrderId = resource.supplementary_data?.related_ids
      ?.order_id as string;
    const purchase =
      await this.purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);

    purchase.status = PurchaseStatus.FAILED;
    purchase.paymentTransactionId = captureId;

    await this.purchaseRepository.saveOne(purchase);

    return new WebhookEventResponseDto(
      WEBHOOK_EVENT_NAME,
      `Order with id ${paymentOrderId} capture failed with id ${captureId}`,
      true,
      PurchaseStatus.FAILED,
    );
  }

  private async handleCancelled(
    resource: IPayPalCaptureResource,
  ): Promise<WebhookEventResponseDto> {
    const captureId = resource.id;
    const paymentOrderId = resource.supplementary_data?.related_ids
      ?.order_id as string;

    const purchase =
      await this.purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);

    purchase.status = PurchaseStatus.CANCELLED;
    purchase.paymentTransactionId = captureId;

    await this.purchaseRepository.saveOne(purchase);

    return new WebhookEventResponseDto(
      WEBHOOK_EVENT_NAME,
      `Order with id ${paymentOrderId} cancelled with id ${captureId}`,
      true,
      PurchaseStatus.CANCELLED,
    );
  }
}

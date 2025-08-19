import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { IPaypalWebhookBody } from '@paypal/application/interface/paypal-webhook-body.interface';
import { IPayPalWebhookHeaders } from '@paypal/application/interface/paypal-webhook-headers.interface';
import { PaypalWebhookService } from '@paypal/application/service/paypal-webhook.service';
import { INVALID_PAYPAL_WEBHOOK } from '@paypal/infrastructure/exception/paypal-exception.messages';

@Injectable()
export class PayPalWebhookGuard implements CanActivate {
  constructor(private readonly paypalWebhookService: PaypalWebhookService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers as unknown as IPayPalWebhookHeaders;
    const body = request.body as IPaypalWebhookBody;

    const isValid = await this.paypalWebhookService.verifyWebhook(
      headers,
      body,
    );

    if (!isValid) {
      throw new ForbiddenException(INVALID_PAYPAL_WEBHOOK);
    }

    return true;
  }
}

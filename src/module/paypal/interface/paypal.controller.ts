import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

import { WebhookEventResponseDto } from '@paypal/application/dto/webhook-event-response.dto';
import { IPaypalWebhookBody } from '@paypal/application/interface/paypal-webhook-body.interface';
import { PaypalWebhookService } from '@paypal/application/service/paypal-webhook.service';
import { PayPalWebhookGuard } from '@paypal/infrastructure/guard/paypal-webhook.guard';

@Controller('paypal')
@UseGuards(PayPalWebhookGuard)
export class PaypalController {
  constructor(private readonly paypalWebhookService: PaypalWebhookService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  async handleWebhook(
    @Body() body: IPaypalWebhookBody,
  ): Promise<WebhookEventResponseDto> {
    return await this.paypalWebhookService.processEvent(
      body.event_type,
      body.resource,
    );
  }
}

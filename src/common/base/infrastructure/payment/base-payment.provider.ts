import { ConfigService } from '@nestjs/config';

abstract class BasePaymentProvider {
  protected readonly returnUrl: string;
  protected readonly cancelUrl: string;
  constructor(protected readonly configService: ConfigService) {
    this.returnUrl = `${this.configService.get<string>('frontend.url')}/payment/success`;
    this.cancelUrl = `${this.configService.get<string>('frontend.url')}/payment/cancel`;
  }
}

export default BasePaymentProvider;

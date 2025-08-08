import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { IPaymentProvider } from '@payment/application/interface/payment-provider.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';

@Injectable()
export class PaymentProviderStorage {
  private readonly collection = new Map<PaymentMethod, IPaymentProvider>();

  add(providerName: PaymentMethod, handler: IPaymentProvider): void {
    this.collection.set(providerName, handler);
  }

  get(providerName: PaymentMethod): IPaymentProvider {
    const handler = this.collection.get(providerName);

    if (!handler) {
      throw new InternalServerErrorException(
        `Can't find instance of payment provider "${providerName}".`,
      );
    }

    return handler;
  }
}

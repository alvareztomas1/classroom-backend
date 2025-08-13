import { Injectable } from '@nestjs/common';

import { IPaymentOrderResponse } from '@payment/application/interface/payment-order-response.interface';
import {
  IBuyer,
  IPaymentService,
} from '@payment/application/service/payment-service.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

@Injectable()
export class PaymentService implements IPaymentService {
  private readonly CURRENCY = 'USD';
  constructor(
    private readonly paymentProviderStorage: PaymentProviderStorage,
  ) {}

  async createPaymentOrder(
    providerName: PaymentMethod,
    amount: number,
    buyer?: IBuyer,
  ): Promise<IPaymentOrderResponse> {
    const paymentProvider = this.paymentProviderStorage.get(providerName);
    return await paymentProvider.createPaymentOrder(
      this.CURRENCY,
      amount,
      buyer,
    );
  }
}

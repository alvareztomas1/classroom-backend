import { Injectable } from '@nestjs/common';

import { IPaymentResponse } from '@payment/application/interface/payment-response.interface';
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

  async createPayment(
    providerName: PaymentMethod,
    amount: number,
    userId: string,
    buyer?: IBuyer,
  ): Promise<IPaymentResponse> {
    const paymentProvider = this.paymentProviderStorage.get(providerName);

    return await paymentProvider.createPayment(
      this.CURRENCY,
      amount,
      userId,
      buyer,
    );
  }
}

import { IPaymentOrderResponse } from '@payment/application/interface/payment-order-response.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';

export interface IPaymentService {
  createPaymentOrder(
    providerName: PaymentMethod,
    amount: number,
    buyer?: IBuyer,
  ): Promise<IPaymentOrderResponse>;
}

export interface IBuyer {
  firstName?: string;
  lastName?: string;
  email?: string;
}

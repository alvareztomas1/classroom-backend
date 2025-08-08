import { IPaymentResponse } from '@payment/application/interface/payment-response.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';

export interface IPaymentService {
  createPayment(
    providerName: PaymentMethod,
    amount: number,
    userId: string,
    buyer?: IBuyer,
  ): Promise<IPaymentResponse>;
}

export interface IBuyer {
  name?: string;
  email?: string;
}

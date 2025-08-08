import { IPaymentResponse } from '@payment/application/interface/payment-response.interface';
import { IBuyer } from '@payment/application/service/payment-service.interface';

export interface IPaymentProvider {
  createPayment(
    currency: string,
    amount: number,
    userId: string,
    buyer?: IBuyer,
  ): Promise<IPaymentResponse>;
}

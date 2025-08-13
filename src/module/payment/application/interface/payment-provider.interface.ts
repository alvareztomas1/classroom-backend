import { IPaymentOrderResponse } from '@payment/application/interface/payment-order-response.interface';
import { IBuyer } from '@payment/application/service/payment-service.interface';

export interface IPaymentProvider {
  createPaymentOrder(
    currency: string,
    amount: number,
    buyer?: IBuyer,
  ): Promise<IPaymentOrderResponse>;
}

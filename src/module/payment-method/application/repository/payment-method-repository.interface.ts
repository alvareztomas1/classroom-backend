import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

export const PAYMENT_METHOD_REPOSITORY_KEY = 'payment_method_repository';

export interface IPaymentMethodRepository
  extends BaseRepository<PaymentMethod> {
  findByName(name: string): Promise<PaymentMethod | null>;
}

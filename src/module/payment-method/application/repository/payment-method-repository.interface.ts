import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';
import { PaymentMethodEntity } from '@module/payment-method/infrastructure/database/payment-method.entity';

export const PAYMENT_METHOD_REPOSITORY_KEY = 'payment_method_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IPaymentMethodRepository
  extends BaseRepository<PaymentMethod, PaymentMethodEntity> {}

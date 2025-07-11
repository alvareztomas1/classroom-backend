import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';
import { PaymentMethodEntity } from '@module/payment-method/infrastructure/database/payment-method.entity';

export class PaymentMethodMapper
  implements IEntityMapper<PaymentMethod, PaymentMethodEntity>
{
  toDomainEntity(entity: PaymentMethodEntity): PaymentMethod {
    const { name, id } = entity;

    return new PaymentMethod(name, id);
  }

  toPersistenceEntity(domain: PaymentMethod): PaymentMethodEntity {
    const { id, name } = domain;

    return new PaymentMethodEntity(name, id);
  }
}

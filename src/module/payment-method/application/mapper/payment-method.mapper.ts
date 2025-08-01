import { Injectable } from '@nestjs/common';

import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { PaymentMethod } from '@payment-method/domain/payment-method.entity';
import { PaymentMethodEntity } from '@payment-method/infrastructure/database/payment-method.entity';

@Injectable()
export class PaymentMethodMapper
  implements IEntityMapper<PaymentMethod, PaymentMethodEntity>
{
  toDomainEntity(entity: PaymentMethodEntity): PaymentMethod {
    const { name, id, createdAt, updatedAt, deletedAt } = entity;

    return new PaymentMethod(
      name,
      id,
      createdAt?.toISOString(),
      updatedAt?.toISOString(),
      deletedAt?.toISOString(),
    );
  }

  toPersistenceEntity(domain: PaymentMethod): PaymentMethodEntity {
    const { id, name } = domain;

    return new PaymentMethodEntity(name, id);
  }
}

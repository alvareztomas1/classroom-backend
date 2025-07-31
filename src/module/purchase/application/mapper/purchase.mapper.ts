import { Injectable } from '@nestjs/common';

import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

@Injectable()
export class PurchaseMapper implements IEntityMapper<Purchase, PurchaseEntity> {
  toDomainEntity(entity: PurchaseEntity): Purchase {
    const {
      userId,
      courseId,
      amount,
      status,
      paymentTransactionId,
      refundTransactionId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    } = entity;

    return new Purchase(
      userId,
      courseId,
      amount,
      status,
      paymentTransactionId,
      refundTransactionId,
      id,
      createdAt?.toISOString(),
      updatedAt?.toISOString(),
      deletedAt?.toISOString(),
    );
  }

  toPersistenceEntity(domain: Purchase): PurchaseEntity {
    const {
      userId,
      courseId,
      amount,
      status,
      paymentTransactionId,
      refundTransactionId,
      id,
    } = domain;

    return new PurchaseEntity(
      userId,
      courseId,
      amount,
      status,
      paymentTransactionId,
      refundTransactionId,
      id,
    );
  }
}

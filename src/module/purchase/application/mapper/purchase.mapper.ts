import { Injectable } from '@nestjs/common';

import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { PaymentMethodMapper } from '@payment-method/application/mapper/payment-method.mapper';

import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

@Injectable()
export class PurchaseMapper implements IEntityMapper<Purchase, PurchaseEntity> {
  constructor(private readonly paymentMethodMapper: PaymentMethodMapper) {}

  toDomainEntity(entity: PurchaseEntity): Purchase {
    const {
      userId,
      courseId,
      amount,
      status,
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod,
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod
        ? this.paymentMethodMapper.toDomainEntity(paymentMethod)
        : undefined,
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    } = domain;

    return new PurchaseEntity(
      userId,
      courseId,
      amount,
      status,
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      id,
      createdAt ? new Date(createdAt) : undefined,
      updatedAt ? new Date(updatedAt) : undefined,
      deletedAt ? new Date(deletedAt) : undefined,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { titleCase } from 'change-case-all';
import { In, Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { PurchaseMapper } from '@purchase/application/mapper/purchase.mapper';
import { IPurchaseRepository } from '@purchase/application/repository/purchase-repository.interface';
import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

@Injectable()
export class PurchasePostgresRepository
  extends BaseRepository<Purchase, PurchaseEntity>
  implements IPurchaseRepository
{
  declare deleteOneByIdOrFail: never;

  constructor(
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepository: Repository<PurchaseEntity>,
    private readonly purchaseMapper: PurchaseMapper,
  ) {
    super(
      purchaseRepository,
      purchaseMapper,
      titleCase(PurchaseEntity.name.replace('Entity', '')),
    );
  }

  async findUserPurchase(
    userId: string,
    courseId: string,
  ): Promise<Purchase | null> {
    const purchaseEntity = await this.purchaseRepository.findOneBy({
      userId,
      courseId,
      status: In([PurchaseStatus.COMPLETED, PurchaseStatus.PENDING]),
    });

    return purchaseEntity
      ? this.purchaseMapper.toDomainEntity(purchaseEntity)
      : null;
  }

  async findByPaymentOrderId(paymentOrderId: string): Promise<Purchase | null> {
    const purchaseEntity = await this.purchaseRepository.findOne({
      where: {
        paymentOrderId,
      },
    });

    return purchaseEntity
      ? this.purchaseMapper.toDomainEntity(purchaseEntity)
      : null;
  }

  async findByPaymentOrderIdOrFail(paymentOrderId: string): Promise<Purchase> {
    const purchaseEntity = await this.findByPaymentOrderId(paymentOrderId);

    if (!purchaseEntity) {
      throw new EntityNotFoundException(
        'paymentOrderId',
        paymentOrderId,
        this.entityType,
      );
    }

    return purchaseEntity;
  }
}

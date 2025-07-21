import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { PurchaseMapper } from '@module/purchase/application/mapper/purchase.mapper';
import { IPurchaseRepository } from '@module/purchase/application/repository/purchase-repository.interface';
import { Purchase } from '@module/purchase/domain/purchase.entity';
import { PurchaseStatus } from '@module/purchase/domain/purchase.status.enum';
import { PurchaseEntity } from '@module/purchase/infrastructure/database/purchase.entity';

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
    super(purchaseRepository, purchaseMapper);
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
}

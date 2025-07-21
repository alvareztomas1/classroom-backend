import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Purchase } from '@module/purchase/domain/purchase.entity';
import { PurchaseEntity } from '@module/purchase/infrastructure/database/purchase.entity';

export const PURCHASE_REPOSITORY_KEY = 'purchase_repository';

export interface IPurchaseRepository
  extends Omit<
    BaseRepository<Purchase, PurchaseEntity>,
    'deleteOneByIdOrFail'
  > {
  findUserPurchase(userId: string, courseId: string): Promise<Purchase | null>;
}

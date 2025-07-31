import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

export const PURCHASE_REPOSITORY_KEY = 'purchase_repository';

export interface IPurchaseRepository
  extends Omit<
    BaseRepository<Purchase, PurchaseEntity>,
    'deleteOneByIdOrFail'
  > {
  findUserPurchase(userId: string, courseId: string): Promise<Purchase | null>;
}

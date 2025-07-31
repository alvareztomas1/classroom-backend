import { Base } from '@common/base/domain/base.entity';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class Purchase extends Base {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  paymentTransactionId?: string;
  refundTransactionId?: string;

  constructor(
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentTransactionId?: string,
    refundTransactionId?: string,
    id?: string,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  ) {
    super(id, createdAt, updatedAt, deletedAt);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
  }
}

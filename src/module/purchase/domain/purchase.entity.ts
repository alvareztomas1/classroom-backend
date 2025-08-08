import { Base } from '@common/base/domain/base.entity';

import { PaymentMethod } from '@payment/domain/payment-method.enum';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class Purchase extends Base {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string;
  refundTransactionId?: string;

  constructor(
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentMethod: PaymentMethod,
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
    this.paymentMethod = paymentMethod;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
  }
}

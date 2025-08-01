import { Base } from '@common/base/domain/base.entity';

import { PaymentMethod } from '@payment-method/domain/payment-method.entity';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class Purchase extends Base {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethodId: string;
  paymentTransactionId?: string;
  refundTransactionId?: string;
  paymentMethod?: PaymentMethod;

  constructor(
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentMethodId: string,
    paymentTransactionId?: string,
    refundTransactionId?: string,
    paymentMethod?: PaymentMethod,
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
    this.paymentMethodId = paymentMethodId;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
    this.paymentMethod = paymentMethod;
  }
}

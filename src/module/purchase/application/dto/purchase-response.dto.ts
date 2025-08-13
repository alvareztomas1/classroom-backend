import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { PaymentMethod } from '@payment/domain/payment-method.enum';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class PurchaseResponseDto extends BaseResponseDto {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethod: PaymentMethod;
  paymentOrderId?: string;
  paymentTransactionId?: string;
  refundTransactionId?: string;
  approveUrl?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(
    type: string,
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentMethod: PaymentMethod,
    paymentOrderId?: string,
    paymentTransactionId?: string,
    refundTransactionId?: string,
    approveUrl?: string,
    id?: string,
    createdAt?: string,
    updatedAt?: string,
  ) {
    super(type, id);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.paymentMethod = paymentMethod;
    this.paymentOrderId = paymentOrderId;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
    this.paymentMethod = paymentMethod;
    this.approveUrl = approveUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

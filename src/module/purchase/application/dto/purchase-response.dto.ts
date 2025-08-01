import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { PaymentMethod } from '@payment-method/domain/payment-method.entity';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export type PaymentMethodPurchaseResponseDto = Pick<
  PaymentMethod,
  'id' | 'name'
>;

export class PurchaseResponseDto extends BaseResponseDto {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  paymentMethodId: string;
  paymentTransactionId?: string;
  refundTransactionId?: string;
  paymentMethod?: PaymentMethodPurchaseResponseDto;
  createdAt?: string;
  updatedAt?: string;

  constructor(
    type: string,
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentMethodId: string,
    paymentTransactionId?: string,
    refundTransactionId?: string,
    paymentMethod?: PaymentMethodPurchaseResponseDto,
    id?: string,
    createdAt?: string,
    updatedAt?: string,
  ) {
    super(type, id);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.paymentMethodId = paymentMethodId;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
    this.paymentMethod = paymentMethod;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

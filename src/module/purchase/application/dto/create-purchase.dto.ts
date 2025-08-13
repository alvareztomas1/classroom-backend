import { OmitType } from '@nestjs/mapped-types';

import { PurchaseDto } from '@purchase/application/dto/purchase.dto';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class CreatePurchaseDto extends OmitType(PurchaseDto, [
  'amount',
  'paymentOrderId',
  'paymentTransactionId',
  'refundTransactionId',
]) {
  amount?: number;
  paymentOrderId?: string;
  paymentTransactionId?: string;
  refundTransactionId?: string;
}

export class CreatePurchaseDtoRequest extends OmitType(CreatePurchaseDto, [
  'userId',
]) {
  status: PurchaseStatus = PurchaseStatus.PENDING;
  userId!: string;
}

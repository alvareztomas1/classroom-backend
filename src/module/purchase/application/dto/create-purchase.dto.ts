import { OmitType } from '@nestjs/mapped-types';

import { PurchaseDto } from '@module/purchase/application/dto/purchase.dto';
import { PurchaseStatus } from '@module/purchase/domain/purchase.status.enum';

export class CreatePurchaseDto extends OmitType(PurchaseDto, ['amount']) {
  amount?: number;
}

export class CreatePurchaseDtoRequest extends OmitType(CreatePurchaseDto, [
  'userId',
  'amount',
]) {
  status: PurchaseStatus = PurchaseStatus.PENDING;
  userId!: string;
}

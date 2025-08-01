import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class UpdatePurchaseDto {
  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsNotEmpty()
  @IsUUID()
  paymentMethodId!: string;

  @ValidateIf(
    (o: UpdatePurchaseDto) =>
      o.status !== undefined &&
      [PurchaseStatus.COMPLETED, PurchaseStatus.FAILED].includes(o.status),
  )
  @IsNotEmpty()
  @IsString()
  paymentTransactionId?: string;

  @ValidateIf((o: UpdatePurchaseDto) => o.status === PurchaseStatus.REFUNDED)
  @IsNotEmpty()
  @IsString()
  refundTransactionId?: string;
}

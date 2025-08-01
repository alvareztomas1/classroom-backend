import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class UpdatePurchaseDto {
  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

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

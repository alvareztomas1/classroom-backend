import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

import { PurchaseStatus } from '@module/purchase/domain/purchase.status.enum';

export class UpdatePurchaseDto {
  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @ValidateIf((o: UpdatePurchaseDto) =>
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

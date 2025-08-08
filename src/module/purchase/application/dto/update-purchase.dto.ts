import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

import { PaymentMethod } from '@payment/domain/payment-method.enum';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class UpdatePurchaseDto {
  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

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

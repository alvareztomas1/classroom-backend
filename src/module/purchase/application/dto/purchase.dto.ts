import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

import { PaymentMethod } from '@payment/domain/payment-method.enum';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class PurchaseDto extends BaseDto {
  @IsNotEmpty()
  @IsUUID('4')
  userId!: string;

  @IsNotEmpty()
  @IsUUID('4')
  courseId!: string;

  @IsNotEmpty()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    { message: 'Amount must be a number with 2 decimal places' },
  )
  @Min(0, { message: 'Amount cannot be negative' })
  @Max(10000, { message: 'Amount cannot exceed $10,000' })
  amount!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsNotEmpty()
  @IsEnum(PurchaseStatus)
  status!: PurchaseStatus;

  @IsOptional()
  @IsString()
  paymentOrderId?: string;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string;

  @IsOptional()
  @IsString()
  refundTransactionId?: string;
}

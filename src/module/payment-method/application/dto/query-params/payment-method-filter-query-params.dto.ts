import { IsOptional, IsString } from 'class-validator';

export class PaymentMethodFilterQueryParamsDto {
  @IsString()
  @IsOptional()
  name?: string;
}

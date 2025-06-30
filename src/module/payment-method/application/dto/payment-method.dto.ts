import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

export class PaymentMethodDto extends BaseDto {
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(20, { message: 'Name cannot be longer than 20 characters' })
  @IsString()
  name!: string;
}

import { PartialType } from '@nestjs/mapped-types';

import { CreatePaymentMethodDto } from '@payment-method/application/dto/create-payment-method.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}

import { PickType } from '@nestjs/mapped-types';

import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';

export class UpdatePurchasePaymentMethodDto extends PickType(
  UpdatePurchaseDto,
  ['paymentMethod'],
) {}

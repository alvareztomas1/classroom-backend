import { OmitType } from '@nestjs/mapped-types';

import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';

export class UpdatePurchaseStatusDto extends OmitType(UpdatePurchaseDto, [
  'paymentMethodId',
]) {}

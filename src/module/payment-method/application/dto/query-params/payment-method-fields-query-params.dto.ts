import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

type PaymentMethodFields = IGetAllOptions<PaymentMethod>['fields'];

export class PaymentMethodFieldsQueryParamsDto {
  @IsIn(['id', 'name', 'createdAt', 'updatedAt', 'deletedAt'], {
    each: true,
  })
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  @IsOptional()
  target?: PaymentMethodFields;
}

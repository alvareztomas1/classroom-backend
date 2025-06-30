import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class PaymentMethodSortQueryParamsDto {
  @IsEnum(SortType)
  @IsOptional()
  name?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  createdAt?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  updatedAt?: SortType;
}

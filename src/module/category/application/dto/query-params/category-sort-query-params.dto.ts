import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class CategorySortQueryParamsDto {
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

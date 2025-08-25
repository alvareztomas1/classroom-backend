import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class CourseSortQueryParamsDto {
  @IsEnum(SortType)
  @IsOptional()
  title?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  description?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  number?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  status?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  price?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  slug?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  difficulty?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  createdAt?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  updatedAt?: SortType;
}

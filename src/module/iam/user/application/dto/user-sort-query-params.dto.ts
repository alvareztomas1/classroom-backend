import { IsEnum, IsOptional } from 'class-validator';

import { SortType } from '@common/base/application/enum/sort-type.enum';

export class UserSortQueryParamsDto {
  @IsEnum(SortType)
  @IsOptional()
  email?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  firstName?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  lastName?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  roles?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  isVerified?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  createdAt?: SortType;

  @IsEnum(SortType)
  @IsOptional()
  updatedAt?: SortType;
}

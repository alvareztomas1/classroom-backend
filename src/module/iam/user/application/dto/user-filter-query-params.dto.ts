import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

import { IsCommaSeparatedEnum } from '@common/base/application/validator/comma-separated-enum.validator';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';

export class UserFilterQueryParamsDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsCommaSeparatedEnum(AppRole)
  @IsOptional()
  roles?: AppRole[];

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  deletedAt?: string;
}

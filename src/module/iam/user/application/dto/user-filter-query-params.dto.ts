import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsEnum(AppRole)
  @IsOptional()
  role?: AppRole;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsBoolean()
  @IsOptional()
  isVerified: boolean;

  @IsString()
  @IsOptional()
  deletedAt?: string;
}

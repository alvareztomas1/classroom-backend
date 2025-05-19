import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';

export class UserDto implements IDto {
  @IsString()
  id: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

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

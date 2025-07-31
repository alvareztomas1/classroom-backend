import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

export class UserDto extends BaseDto {
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

  @IsArray()
  @IsEnum(AppRole, { each: true })
  @IsOptional()
  roles?: AppRole[];

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}

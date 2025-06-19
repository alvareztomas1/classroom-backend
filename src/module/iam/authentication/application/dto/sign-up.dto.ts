import { OmitType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

export class SignUpDto implements IDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class SignUpQueryDto extends OmitType(SignUpDto, ['avatarUrl']) {}

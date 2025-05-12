import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

export class CreateUserDto implements IDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (value as string).toLowerCase())
  readonly email: string;

  @IsNotEmpty()
  readonly firstName: string;

  @IsNotEmpty()
  readonly lastName: string;

  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

export class SignInDto implements IDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

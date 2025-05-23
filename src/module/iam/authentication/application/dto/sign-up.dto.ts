import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

export class SignUpDto implements IDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;
}

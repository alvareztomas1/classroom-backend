import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class ConfirmUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumberString()
  @IsNotEmpty()
  code: string;
}

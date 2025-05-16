import { IsEmail, IsNotEmpty } from 'class-validator';

export class ConfirmPasswordDto {
  @IsNotEmpty()
  code: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  newPassword: string;
}

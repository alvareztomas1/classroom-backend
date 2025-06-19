import { IsEmail, IsNotEmpty } from 'class-validator';

export class RefreshSessionDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  refreshToken!: string;
}

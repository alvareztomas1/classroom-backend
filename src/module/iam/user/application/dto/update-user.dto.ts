import { OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';

import { UserDto } from '@module/iam/user/application/dto/user.dto';

export class UpdateUserDto
  implements Pick<UserDto, 'firstName' | 'lastName' | 'avatarUrl'>
{
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  constructor(firstName?: string, lastName?: string, avatarUrl?: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarUrl = avatarUrl;
  }
}

export class UpdateUserDtoQuery extends OmitType(UpdateUserDto, ['avatarUrl']) {
  avatarUrl?: string;
}

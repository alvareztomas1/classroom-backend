import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';

export class UserResponseDto extends BaseResponseDto {
  email: string;
  firstName: string;
  lastName: string;
  roles: AppRole[];
  isVerified?: boolean;
  externalId?: string;
  avatarUrl?: string;

  constructor(
    type: string,
    email: string,
    firstName: string,
    lastName: string,
    roles: AppRole[],
    avatarUrl?: string,
    externalId?: string,
    id?: string,
    isVerified?: boolean,
  ) {
    super(type, id);

    this.externalId = externalId;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.roles = roles;
    this.avatarUrl = avatarUrl;
    this.isVerified = isVerified;
  }
}

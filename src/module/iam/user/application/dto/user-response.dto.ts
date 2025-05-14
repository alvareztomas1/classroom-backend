import { IDto } from '@common/base/application/dto/dto.interface';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';

export class UserResponseDto implements IDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  isVerified: boolean;
  externalId?: string;
  avatarUrl?: string;

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: AppRole,
    isVerified: boolean,
    avatarUrl?: string,
    externalId?: string,
  ) {
    this.id = id;
    this.externalId = externalId;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.avatarUrl = avatarUrl;
    this.isVerified = isVerified;
  }
}

import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';

export class User extends Base {
  externalId?: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AppRole[];
  avatarUrl?: string;
  isVerified: boolean;

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    roles: AppRole[],
    avatarUrl?: string,
    id?: string,
    externalId?: string,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
    isVerified?: boolean,
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.email = email;
    this.externalId = externalId;
    this.roles = roles;
    this.avatarUrl = avatarUrl;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isVerified = isVerified;
  }
}

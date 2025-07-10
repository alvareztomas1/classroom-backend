import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { AppAbility } from '@module/iam/authorization/infrastructure/casl/type/app-ability.type';
import { AppSubjects } from '@module/iam/authorization/infrastructure/casl/type/app-subjects.type';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly permissionStorage: AppSubjectPermissionStorage,
  ) {}

  createForUser(user: User, subject: AppSubjects): AppAbility {
    const subjectType = this.resolveSubjectType(subject);
    const permissions = this.permissionStorage.getPermissions(
      subjectType,
    ) as IPermissionsDefinition;

    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    this.applyPermissions(user, permissions, builder);

    return builder.build({
      detectSubjectType: () => subjectType,
    });
  }

  private resolveSubjectType(
    subject: AppSubjects,
  ): ExtractSubjectType<AppSubjects> {
    const type =
      typeof subject === 'function' ? subject : (subject as object).constructor;

    if (
      'domainClass' in type &&
      typeof (type as typeof BaseEntity).domainClass === 'function'
    ) {
      return (type as typeof BaseEntity)
        .domainClass as ExtractSubjectType<AppSubjects>;
    }

    return type as ExtractSubjectType<AppSubjects>;
  }

  private applyPermissions(
    user: User,
    permissions: IPermissionsDefinition,
    builder: AbilityBuilder<AppAbility>,
  ): void {
    for (const role of user.roles) {
      permissions[role]?.(user, builder);
    }
  }
}

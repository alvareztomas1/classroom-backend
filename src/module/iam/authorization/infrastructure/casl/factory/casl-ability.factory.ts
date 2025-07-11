import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

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
      detectSubjectType: (subject) => this.getSubjectConstructor(subject),
    });
  }

  private resolveSubjectType(
    subject: AppSubjects,
  ): ExtractSubjectType<AppSubjects> {
    if (typeof subject === 'function') {
      return subject;
    }

    return subject.constructor as ExtractSubjectType<AppSubjects>;
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

  private getSubjectConstructor(
    subject: unknown,
  ): ExtractSubjectType<AppSubjects> {
    return (subject as object).constructor as ExtractSubjectType<AppSubjects>;
  }
}

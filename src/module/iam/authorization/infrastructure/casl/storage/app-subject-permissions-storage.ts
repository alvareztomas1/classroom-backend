import { Injectable } from '@nestjs/common';

import { AppSubjects } from '@module/iam/authorization/infrastructure/casl/type/app-subjects.type';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';

@Injectable()
export class AppSubjectPermissionStorage {
  private readonly permissionsMap = new Map<
    AppSubjects,
    IPermissionsDefinition
  >();

  set(subject: AppSubjects, permissions: IPermissionsDefinition): void {
    this.permissionsMap.set(subject, permissions);
  }

  getPermissions(subject: AppSubjects): IPermissionsDefinition | null {
    return this.permissionsMap.get(subject) ?? null;
  }
}

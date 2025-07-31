import { Course } from '@course/domain/course.entity';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';

export const coursePermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { can }) {
    can(AppAction.Read, Course);
  },
  [AppRole.Admin](user, { can }) {
    can([AppAction.Read, AppAction.Create], Course);
    can([AppAction.Update, AppAction.Delete], Course, {
      instructorId: user.id,
    });
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, Course);
  },
};

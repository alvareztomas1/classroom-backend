import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Course } from '@course/domain/course.entity';

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

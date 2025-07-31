import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Lesson } from '@module/lesson/domain/lesson.entity';

export const lessonPermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { cannot }) {
    cannot(AppAction.Manage, Lesson);
  },
  [AppRole.Admin](user, { can }) {
    can(AppAction.Manage, Lesson, {
      instructorId: user.id,
    });
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, Lesson);
  },
};

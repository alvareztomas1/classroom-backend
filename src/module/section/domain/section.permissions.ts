import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Section } from '@section/domain/section.entity';

export const sectionPermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { cannot }) {
    cannot(AppAction.Manage, Section);
  },
  [AppRole.Admin](user, { can }) {
    can(AppAction.Manage, Section, { instructorId: user.id });
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, Section);
  },
};

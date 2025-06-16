import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { Section } from '@module/section/domain/section.entity';

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

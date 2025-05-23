import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { User } from '@module/iam/user/domain/user.entity';

export const userPermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { cannot }) {
    cannot(AppAction.Manage, User);
  },
  [AppRole.Admin](_, { cannot }) {
    cannot(AppAction.Manage, User);
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, User);
  },
};

import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { User } from '@iam/user/domain/user.entity';

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

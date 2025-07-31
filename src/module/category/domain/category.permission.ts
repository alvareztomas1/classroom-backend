import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Category } from '@module/category/domain/category.entity';

export const categoryPermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { can }) {
    can(AppAction.Read, Category);
  },
  [AppRole.Admin](_, { can }) {
    can(AppAction.Read, Category);
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, Category);
  },
};

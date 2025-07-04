import { Category } from '@module/category/domain/category.entity';
import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';

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

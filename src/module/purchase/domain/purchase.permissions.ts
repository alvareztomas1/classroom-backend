import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Purchase } from '@module/purchase/domain/purchase.entity';

export const purchasePermissions: IPermissionsDefinition = {
  [AppRole.Regular](user, { can }) {
    can(AppAction.Read, Purchase, {
      userId: user.id,
    });
  },
  [AppRole.Admin](user, { can }) {
    can(AppAction.Read, Purchase, {
      userId: user.id,
    });
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, Purchase);
  },
};

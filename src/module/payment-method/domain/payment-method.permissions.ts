import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

export const paymentMethodPermissions: IPermissionsDefinition = {
  [AppRole.Regular](_, { can }) {
    can(AppAction.Read, PaymentMethod);
  },
  [AppRole.Admin](_, { can }) {
    can(AppAction.Read, PaymentMethod);
  },
  [AppRole.SuperAdmin](_, { can }) {
    can(AppAction.Manage, PaymentMethod);
  },
};

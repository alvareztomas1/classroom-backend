import { AbilityBuilder } from '@casl/ability';

import { AppAbility } from '@module/iam/authorization/infrastructure/casl/type/app-ability.type';
import { User } from '@module/iam/user/domain/user.entity';

export type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

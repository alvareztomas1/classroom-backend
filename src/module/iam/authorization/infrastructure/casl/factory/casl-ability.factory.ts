import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { PERMISSIONS_FOR_FEATURE_KEY } from '@module/iam/authorization/authorization.constants';
import { AppAbility } from '@module/iam/authorization/infrastructure/casl/type/app-ability.type';
import { AppSubjects } from '@module/iam/authorization/infrastructure/casl/type/app-subjects.type';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject(PERMISSIONS_FOR_FEATURE_KEY)
    private readonly permissions: IPermissionsDefinition,
  ) {}

  createForUser(user: User): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    user.roles.forEach((role) => {
      this.permissions[role](user, builder);
    });

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<AppSubjects>,
    });
  }
}

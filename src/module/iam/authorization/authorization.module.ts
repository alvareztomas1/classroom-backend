import { DynamicModule, Module } from '@nestjs/common';

import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { PERMISSIONS_FOR_FEATURE_KEY } from '@module/iam/authorization/authorization.constants';
import { CaslAbilityFactory } from '@module/iam/authorization/infrastructure/casl/factory/casl-ability.factory';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { IPermissionsDefinition } from '@module/iam/authorization/infrastructure/policy/type/permissions-definition.interface';

export interface IAuthorizationModuleForFeatureOptions {
  permissions: IPermissionsDefinition;
}

@Module({})
export class AuthorizationModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthorizationModule,
      global: true,
      providers: [PolicyHandlerStorage],
      exports: [PolicyHandlerStorage],
    };
  }

  static forFeature(
    options: IAuthorizationModuleForFeatureOptions,
  ): DynamicModule {
    const permissionsProvider = {
      provide: PERMISSIONS_FOR_FEATURE_KEY,
      useValue: options.permissions,
    };

    return {
      module: AuthorizationModule,
      providers: [
        AuthorizationService,
        CaslAbilityFactory,
        PoliciesGuard,
        permissionsProvider,
      ],
      exports: [
        AuthorizationService,
        CaslAbilityFactory,
        PoliciesGuard,
        permissionsProvider,
      ],
    };
  }
}

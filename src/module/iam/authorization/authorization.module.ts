import { DynamicModule, Module } from '@nestjs/common';

import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { CaslAbilityFactory } from '@module/iam/authorization/infrastructure/casl/factory/casl-ability.factory';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
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
      providers: [PolicyHandlerStorage, AppSubjectPermissionStorage],
      exports: [PolicyHandlerStorage, AppSubjectPermissionStorage],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: AuthorizationModule,
      providers: [AuthorizationService, CaslAbilityFactory, PoliciesGuard],
      exports: [AuthorizationService, CaslAbilityFactory, PoliciesGuard],
    };
  }
}

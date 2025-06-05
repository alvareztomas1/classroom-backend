import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class ReadUserPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Read;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
    this.policyHandlerStorage.add(ReadUserPolicyHandler, this);
  }

  handle(request: Request): void {
    const currentUser = this.getCurrentUser(request);
    const isAllowed = this.authorizationService.isAllowed(
      currentUser,
      this.action,
      User,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

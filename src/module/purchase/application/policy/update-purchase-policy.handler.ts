import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

import { Purchase } from '@purchase/domain/purchase.entity';

@Injectable()
export class UpdatePurchasePolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
    this.policyHandlerStorage.add(UpdatePurchasePolicyHandler, this);
  }

  handle(request: Request): void {
    const user = this.getCurrentUser(request);

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      Purchase,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

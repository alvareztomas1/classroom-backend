import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

@Injectable()
export class UpdatePaymentMethodPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
    this.policyHandlerStorage.add(UpdatePaymentMethodPolicyHandler, this);
  }

  handle(request: Request): Promise<void> | void {
    const user = this.getCurrentUser(request);

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      PaymentMethod,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

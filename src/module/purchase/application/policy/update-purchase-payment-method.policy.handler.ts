import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

import {
  IPurchaseRepository,
  PURCHASE_REPOSITORY_KEY,
} from '@purchase/application/repository/purchase-repository.interface';

@Injectable()
export class UpdatePurchasePaymentMethodPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(PURCHASE_REPOSITORY_KEY)
    private readonly purchaseRepository: IPurchaseRepository,
  ) {
    super();
    this.policyHandlerStorage.add(
      UpdatePurchasePaymentMethodPolicyHandler,
      this,
    );
  }

  async handle(request: Request): Promise<void> {
    const user = this.getCurrentUser(request);

    const purchaseId = request.params.id;
    const purchase = await this.purchaseRepository.getOneByIdOrFail(purchaseId);

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      purchase,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

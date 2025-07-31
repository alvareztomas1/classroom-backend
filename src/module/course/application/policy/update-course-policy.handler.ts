import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@course/application/repository/repository.interface';

@Injectable()
export class UpdateCoursePolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    @Inject(COURSE_REPOSITORY_KEY)
    private readonly courseRepository: ICourseRepository,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
    this.policyHandlerStorage.add(UpdateCoursePolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const user = this.getCurrentUser(request);
    const { id } = request.params;
    const course = await this.courseRepository.getOneByIdOrFail(id);

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      course,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

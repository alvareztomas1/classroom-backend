import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@module/course/application/repository/repository.interface';
import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';

@Injectable()
export class DeleteCoursePolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Delete;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    @Inject(COURSE_REPOSITORY_KEY)
    private readonly courseRepository: ICourseRepository,
    private readonly authorizationService: AuthorizationService,
  ) {
    super();
    this.policyHandlerStorage.add(DeleteCoursePolicyHandler, this);
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

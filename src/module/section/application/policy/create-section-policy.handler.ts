import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@course/application/repository/repository.interface';

import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { Section } from '@module/section/domain/section.entity';

@Injectable()
export class CreateSectionPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Create;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(COURSE_REPOSITORY_KEY)
    private readonly courseRepository: ICourseRepository,
  ) {
    super();
    this.policyHandlerStorage.add(CreateSectionPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const { courseId } = request.params;
    const course = await this.courseRepository.getOneByIdOrFail(courseId);
    const user = this.getCurrentUser(request);
    const userIsSuperAdmin = user.roles.includes(AppRole.SuperAdmin);

    if (course.instructorId !== user.id && !userIsSuperAdmin) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      Section,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

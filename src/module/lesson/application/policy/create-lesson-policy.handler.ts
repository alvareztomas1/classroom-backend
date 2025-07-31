import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

import { Lesson } from '@module/lesson/domain/lesson.entity';
import {
  ISectionRepository,
  SECTION_REPOSITORY_KEY,
} from '@module/section/application/repository/section.repository.interface';

export class CreateLessonPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Create;
  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(SECTION_REPOSITORY_KEY)
    private readonly sectionRepository: ISectionRepository,
  ) {
    super();
    this.policyHandlerStorage.add(CreateLessonPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const { courseId, sectionId } = request.params;
    const section = await this.sectionRepository.getOneByIdOrFail(sectionId, [
      'course',
    ]);
    const user = this.getCurrentUser(request);
    const userIsSuperAdmin = user.roles.includes(AppRole.SuperAdmin);

    if (section.courseId !== courseId) {
      throw new BadRequestException(
        `The section with id ${sectionId} does not belong to the course with id ${courseId}`,
      );
    }

    if (section.instructorId !== user.id && !userIsSuperAdmin) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      Lesson,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

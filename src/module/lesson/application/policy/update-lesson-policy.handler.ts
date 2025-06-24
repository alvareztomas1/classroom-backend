import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import {
  ILessonRepository,
  LESSON_REPOSITORY_KEY,
} from '@module/lesson/application/repository/lesson.repository.interface';
import { Lesson } from '@module/lesson/domain/lesson.entity';

export class UpdateLessonPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;
  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(LESSON_REPOSITORY_KEY)
    private readonly lessonRepository: ILessonRepository,
  ) {
    super();
    this.policyHandlerStorage.add(UpdateLessonPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const { courseId, sectionId, id: lessonId } = request.params;
    const lesson = await this.lessonRepository.getOneByIdOrFail(lessonId, [
      'section',
      'section.course' as keyof Lesson,
    ]);

    if (lesson.sectionId !== sectionId) {
      throw new BadRequestException(
        `The lesson with id ${lessonId} does not belong to the section with id ${sectionId}`,
      );
    }

    if (lesson.section?.courseId !== courseId) {
      throw new BadRequestException(
        `The section with id ${sectionId} does not belong to the course with id ${courseId}`,
      );
    }

    const user = this.getCurrentUser(request);

    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      lesson,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

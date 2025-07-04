import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { BasePolicyHandler } from '@module/iam/authorization/application/policy/base-policy.handler';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@module/iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import {
  ISectionRepository,
  SECTION_REPOSITORY_KEY,
} from '@module/section/application/repository/section.repository.interface';

@Injectable()
export class UpdateSectionPolicyHandler
  extends BasePolicyHandler
  implements IPolicyHandler
{
  private readonly action = AppAction.Update;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
    @Inject(SECTION_REPOSITORY_KEY)
    private readonly sectionRepository: ISectionRepository,
  ) {
    super();
    this.policyHandlerStorage.add(UpdateSectionPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const { courseId, id: sectionId } = request.params;
    const section = await this.sectionRepository.getOneByIdOrFail(sectionId, [
      'course',
    ]);

    if (section.courseId !== courseId) {
      throw new BadRequestException(
        `The section with id ${sectionId} does not belong to the course with id ${courseId}`,
      );
    }

    const user = this.getCurrentUser(request);
    const isAllowed = this.authorizationService.isAllowed(
      user,
      this.action,
      section,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }
}

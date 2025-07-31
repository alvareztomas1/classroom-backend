import { Inject, Injectable } from '@nestjs/common';

import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { IS_NOT_VALID_MESSAGE } from '@common/base/application/exception/base-exception.messages';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@course/application/repository/repository.interface';

import { CreatePurchaseDto } from '@purchase/application/dto/create-purchase.dto';
import { PurchaseResponseDto } from '@purchase/application/dto/purchase-response.dto';
import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';
import { CourseNotPublishedException } from '@purchase/application/exception/course-not-published.exception';
import { InvalidPurchaseException } from '@purchase/application/exception/invalid-purchase.exception';
import { PurchaseAlreadyExists } from '@purchase/application/exception/purchase-already-exists-exception';
import {
  CAN_NOT_BUY_OWN_COURSE_MESSAGE,
  COURSE_NOT_PUBLISHED_MESSAGE,
  COURSE_WITH_ID_MESSAGE,
  PURCHASE_ALREADY_EXISTS_MESSAGE,
  PURCHASE_FOR_COURSE_MESSAGE,
  STATUS_TRANSITION_MESSAGE,
} from '@purchase/application/exception/purchase-exception.messages';
import { SelfPurchaseNotAllowedException } from '@purchase/application/exception/self-purchase-not-allowed.exception';
import { PurchaseDtoMapper } from '@purchase/application/mapper/purchase-dto.mapper';
import {
  IPurchaseRepository,
  PURCHASE_REPOSITORY_KEY,
} from '@purchase/application/repository/purchase-repository.interface';
import { IPurchaseCRUDService } from '@purchase/application/service/purchase-CRUD-service.interface';
import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';
import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

@Injectable()
export class PurchaseCRUDService
  extends BaseCRUDService<
    Purchase,
    PurchaseEntity,
    CreatePurchaseDto,
    UpdatePurchaseDto,
    PurchaseResponseDto
  >
  implements IPurchaseCRUDService
{
  declare deleteOneByIdOrFail: never;

  constructor(
    @Inject(PURCHASE_REPOSITORY_KEY)
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly purchaseDtoMapper: PurchaseDtoMapper,
    @Inject(COURSE_REPOSITORY_KEY)
    private readonly courseRepository: ICourseRepository,
  ) {
    super(
      purchaseRepository as unknown as BaseRepository<Purchase, PurchaseEntity>,
      purchaseDtoMapper,
      Purchase.getEntityName(),
    );
  }

  async saveOne(createDto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    const { courseId, userId } = createDto;
    const course = await this.courseRepository.getOneByIdOrFail(courseId);
    const existingPurchase = await this.purchaseRepository.findUserPurchase(
      userId,
      courseId,
    );

    this.validatePurchase(
      courseId,
      userId,
      course.instructorId,
      existingPurchase,
      course.status,
    );

    createDto.amount = course.price!;
    return await super.saveOne(createDto);
  }

  async updateOneByIdOrFail(
    id: string,
    updateDto: UpdatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    const purchaseToUpdate = await this.purchaseRepository.getOneByIdOrFail(id);
    this.validateStatusTransition(purchaseToUpdate.status, updateDto.status);
    const purchase = this.purchaseDtoMapper.fromUpdateDtoToEntity(
      purchaseToUpdate,
      updateDto,
    );
    const updatedPurchase = await this.purchaseRepository.saveOne(purchase);
    const responseDto =
      this.purchaseDtoMapper.fromEntityToResponseDto(updatedPurchase);
    return responseDto;
  }

  private validatePurchase(
    courseId: string,
    userId: string,
    instructorId: string,
    existingPurchase: Purchase | null,
    courseStatus?: PublishStatus,
  ): void {
    if (courseStatus !== PublishStatus.published) {
      throw new CourseNotPublishedException({
        message: `${COURSE_WITH_ID_MESSAGE} ${courseId} ${COURSE_NOT_PUBLISHED_MESSAGE}`,
      });
    } else if (instructorId === userId) {
      throw new SelfPurchaseNotAllowedException({
        message: CAN_NOT_BUY_OWN_COURSE_MESSAGE,
      });
    } else if (existingPurchase) {
      throw new PurchaseAlreadyExists({
        message: `${PURCHASE_FOR_COURSE_MESSAGE} ${courseId} ${PURCHASE_ALREADY_EXISTS_MESSAGE} ${existingPurchase.status}`,
      });
    }
  }

  private validateStatusTransition(
    current: PurchaseStatus,
    next: PurchaseStatus,
  ): void {
    const validTransitions: Record<PurchaseStatus, PurchaseStatus[]> = {
      [PurchaseStatus.PENDING]: [
        PurchaseStatus.COMPLETED,
        PurchaseStatus.FAILED,
      ],
      [PurchaseStatus.COMPLETED]: [PurchaseStatus.REFUNDED],
      [PurchaseStatus.FAILED]: [],
      [PurchaseStatus.REFUNDED]: [],
    };

    if (!validTransitions[current].includes(next)) {
      throw new InvalidPurchaseException({
        message: `${STATUS_TRANSITION_MESSAGE} ${current} to ${next} ${IS_NOT_VALID_MESSAGE}`,
      });
    }
  }
}

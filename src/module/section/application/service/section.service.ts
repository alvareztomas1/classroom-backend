import { Inject, Injectable } from '@nestjs/common';

import {
  OPERATION_RESPONSE_TYPE,
  SuccessOperationResponseDto,
} from '@common/base/application/dto/success-operation-response.dto';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CreateSectionDto } from '@section/application/dto/create.section.dto';
import { SectionResponseDto } from '@section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@section/application/dto/update.section.dto';
import { SectionDtoMapper } from '@section/application/mapper/section-dto.mapper';
import {
  ISectionRepository,
  SECTION_REPOSITORY_KEY,
} from '@section/application/repository/section.repository.interface';
import { Section } from '@section/domain/section.entity';
import { SectionEntity } from '@section/infrastructure/database/section.entity';

@Injectable()
export class SectionService extends BaseCRUDService<
  Section,
  SectionEntity,
  CreateSectionDto,
  UpdateSectionDto,
  SectionResponseDto
> {
  constructor(
    @Inject(SECTION_REPOSITORY_KEY) repository: ISectionRepository,
    protected readonly mapper: SectionDtoMapper,
  ) {
    super(repository, mapper, Section.getEntityName());
  }

  async deleteOneByIdOrFail(id: string): Promise<SuccessOperationResponseDto> {
    await this.repository.deleteOneByIdOrFail(id);

    return new SuccessOperationResponseDto(
      `The ${this.entityName} with id ${id} has been deleted successfully`,
      true,
      OPERATION_RESPONSE_TYPE,
    );
  }
}

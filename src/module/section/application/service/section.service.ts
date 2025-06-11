import { Inject, Injectable } from '@nestjs/common';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CreateSectionDto } from '@module/section/application/dto/create.section.dto';
import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';
import { SectionMapper } from '@module/section/application/mapper/section.mapper';
import {
  ISectionRepository,
  SECTION_REPOSITORY_KEY,
} from '@module/section/application/repository/section.repository.interface';
import { Section } from '@module/section/domain/section.entity';

@Injectable()
export class SectionService extends BaseCRUDService<
  Section,
  CreateSectionDto,
  UpdateSectionDto,
  SectionResponseDto
> {
  constructor(
    @Inject(SECTION_REPOSITORY_KEY) repository: ISectionRepository,
    protected readonly mapper: SectionMapper,
  ) {
    super(repository, mapper, Section.getEntityName());
  }
}

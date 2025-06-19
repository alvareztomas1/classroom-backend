import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { CreateSectionDto } from '@module/section/application/dto/create.section.dto';
import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';
import { Section } from '@module/section/domain/section.entity';

export class SectionMapper
  implements
    IDtoMapper<Section, CreateSectionDto, UpdateSectionDto, SectionResponseDto>
{
  fromCreateDtoToEntity(dto: CreateSectionDto): Section {
    return new Section(
      dto.id,
      dto.courseId,
      dto.title,
      dto.description,
      dto.position,
    );
  }

  fromUpdateDtoToEntity(entity: Section, dto: UpdateSectionDto): Section {
    return new Section(
      dto.id ?? entity.id,
      dto.courseId ?? entity.courseId,
      dto.title ?? entity.title,
      dto.description ?? entity.description,
      dto.position ?? entity.position,
    );
  }

  fromEntityToResponseDto(entity: Section): SectionResponseDto {
    return new SectionResponseDto(
      Section.getEntityName(),
      entity.title,
      entity.description,
      entity.position,
      entity.courseId,
      entity.id,
    );
  }
}

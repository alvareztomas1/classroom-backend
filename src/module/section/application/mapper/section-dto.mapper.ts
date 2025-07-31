import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { CreateSectionDto } from '@section/application/dto/create.section.dto';
import { SectionResponseDto } from '@section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@section/application/dto/update.section.dto';
import { Section } from '@section/domain/section.entity';

export class SectionDtoMapper
  implements
    IDtoMapper<Section, CreateSectionDto, UpdateSectionDto, SectionResponseDto>
{
  fromCreateDtoToEntity(dto: CreateSectionDto): Section {
    return new Section(
      dto.courseId,
      dto.title,
      dto.description,
      dto.position,
      dto.id,
    );
  }

  fromUpdateDtoToEntity(entity: Section, dto: UpdateSectionDto): Section {
    return new Section(
      dto.courseId ?? entity.courseId,
      dto.title ?? entity.title,
      dto.description ?? entity.description,
      dto.position ?? entity.position,
      dto.id ?? entity.id,
    );
  }

  fromEntityToResponseDto(entity: Section): SectionResponseDto {
    return new SectionResponseDto(
      Section.getEntityName(),
      entity.courseId,
      entity.title,
      entity.description,
      entity.position,
      entity.id,
    );
  }
}

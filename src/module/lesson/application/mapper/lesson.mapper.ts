import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { CreateLessonDto } from '@module/lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@module/lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@module/lesson/application/dto/update-lesson.dto';
import { Lesson } from '@module/lesson/domain/lesson.entity';

export class LessonMapper
  implements
    IDtoMapper<Lesson, CreateLessonDto, UpdateLessonDto, LessonResponseDto>
{
  fromCreateDtoToEntity(dto: CreateLessonDto): Lesson {
    return new Lesson(
      dto.courseId,
      dto.sectionId,
      dto.id,
      dto.title,
      dto.description,
      dto.url,
      dto.lessonType,
    );
  }

  fromUpdateDtoToEntity(entity: Lesson, dto: UpdateLessonDto): Lesson {
    return new Lesson(
      dto.courseId ?? entity.courseId,
      dto.sectionId ?? entity.sectionId,
      dto.id ?? entity.id,
      dto.title ?? entity.title,
      dto.description ?? entity.description,
      dto.url ?? entity.url,
      dto.lessonType ?? entity.lessonType,
    );
  }

  fromEntityToResponseDto(entity: Lesson): LessonResponseDto {
    return new LessonResponseDto(
      Lesson.getEntityName(),
      entity.courseId,
      entity.sectionId,
      entity.title,
      entity.description,
      entity.url,
      entity.lessonType,
      entity.id,
      entity.section,
    );
  }
}

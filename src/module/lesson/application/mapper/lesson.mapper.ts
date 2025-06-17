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
      dto.id,
      dto.courseId,
      dto.sectionId,
      dto.title,
      dto.description,
      dto.url,
      dto.lessonType,
    );
  }

  fromUpdateDtoToEntity(dto: UpdateLessonDto): Lesson {
    return new Lesson(
      dto.id,
      dto.courseId,
      dto.sectionId,
      dto.title,
      dto.description,
      dto.url,
      dto.lessonType,
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

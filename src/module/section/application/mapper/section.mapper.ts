import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

import { Section } from '@module/section/domain/section.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

export class SectionMapper implements IEntityMapper<Section, SectionEntity> {
  toDomainEntity(entity: SectionEntity): Section {
    return new Section(
      entity.courseId,
      entity.title,
      entity.description,
      entity.position,
      entity.id,
      entity.course as Course,
      entity.lessons as Lesson[],
    );
  }

  toPersistenceEntity(entity: Section): SectionEntity {
    return new SectionEntity(
      entity.courseId,
      entity.id,
      entity.title,
      entity.description,
      entity.position,
      entity.course as CourseEntity,
      entity.lessons as LessonEntity[],
    );
  }
}

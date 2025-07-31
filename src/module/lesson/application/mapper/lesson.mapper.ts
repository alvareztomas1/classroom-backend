import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonType } from '@lesson/domain/lesson.type';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

import { Section } from '@module/section/domain/section.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

export class LessonMapper implements IEntityMapper<Lesson, LessonEntity> {
  toDomainEntity(entity: LessonEntity): Lesson {
    return new Lesson(
      entity.courseId,
      entity.sectionId,
      entity.id,
      entity.title,
      entity.description,
      entity.url,
      entity.lessonType as LessonType,
      entity.section as Section,
    );
  }

  toPersistenceEntity(domain: Lesson): LessonEntity {
    return new LessonEntity(
      domain.courseId,
      domain.sectionId,
      domain.id,
      domain.title,
      domain.description,
      domain.url,
      domain.lessonType,
      domain.section as SectionEntity,
    );
  }
}

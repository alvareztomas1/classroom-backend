import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { SectionMapper } from '@section/application/mapper/section.mapper';
import { Section } from '@section/domain/section.entity';

import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonType } from '@lesson/domain/lesson.type';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

@Injectable()
export class LessonMapper implements IEntityMapper<Lesson, LessonEntity> {
  constructor(
    @Inject(forwardRef(() => SectionMapper))
    private readonly sectionMapper: SectionMapper,
  ) {}
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
      domain.section
        ? this.sectionMapper.toPersistenceEntity(domain.section)
        : undefined,
    );
  }
}

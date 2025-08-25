import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { CourseMapper } from '@course/application/mapper/course.mapper';

import { Section } from '@section/domain/section.entity';
import { SectionEntity } from '@section/infrastructure/database/section.entity';

import { LessonMapper } from '@lesson/application/mapper/lesson.mapper';

@Injectable()
export class SectionMapper implements IEntityMapper<Section, SectionEntity> {
  constructor(
    @Inject(forwardRef(() => CourseMapper))
    private readonly courseMapper: CourseMapper,
    @Inject(forwardRef(() => LessonMapper))
    private readonly lessonMapper: LessonMapper,
  ) {}

  toDomainEntity(entity: SectionEntity): Section {
    return new Section(
      entity.courseId,
      entity.title,
      entity.description,
      entity.position,
      entity.id,
      entity.course
        ? this.courseMapper.toDomainEntity(entity.course)
        : undefined,
      entity.lessons
        ? entity.lessons?.map((lesson) =>
            this.lessonMapper.toDomainEntity(lesson),
          )
        : undefined,
    );
  }

  toPersistenceEntity(entity: Section): SectionEntity {
    return new SectionEntity(
      entity.courseId,
      entity.id,
      entity.title,
      entity.description,
      entity.position,
      entity.course
        ? this.courseMapper.toPersistenceEntity(entity.course)
        : undefined,
      entity.lessons
        ? entity.lessons.map((lesson) =>
            this.lessonMapper.toPersistenceEntity(lesson),
          )
        : undefined,
    );
  }
}

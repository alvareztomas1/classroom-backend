import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { UserMapper } from '@iam/user/application/mapper/user.mapper';

import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { CategoryMapper } from '@category/application/mapper/category.mapper';

import { SectionMapper } from '@section/application/mapper/section.mapper';

@Injectable()
export class CourseMapper implements IEntityMapper<Course, CourseEntity> {
  constructor(
    private readonly userMapper: UserMapper,
    @Inject(forwardRef(() => SectionMapper))
    private readonly sectionMapper: SectionMapper,
    private readonly categoryMapper: CategoryMapper,
  ) {}
  toDomainEntity(entity: CourseEntity): Course {
    return new Course(
      entity.instructorId,
      entity.id,
      entity.title,
      entity.description,
      entity.price,
      entity.imageUrl,
      entity.slug,
      entity.difficulty as Difficulty,
      entity.status,
      entity.instructor
        ? this.userMapper.toDomainEntity(entity.instructor)
        : undefined,
      entity.sections
        ? entity.sections.map((section) =>
            this.sectionMapper.toDomainEntity(section),
          )
        : undefined,
      entity.category
        ? this.categoryMapper.toDomainEntity(entity.category)
        : undefined,
    );
  }

  toPersistenceEntity(domainEntity: Course): CourseEntity {
    return new CourseEntity(
      domainEntity.instructorId,
      domainEntity.id,
      domainEntity.title,
      domainEntity.description,
      domainEntity.price,
      domainEntity.imageUrl,
      domainEntity.status,
      domainEntity.slug,
      domainEntity.difficulty,
      domainEntity.instructor
        ? this.userMapper.toPersistenceEntity(domainEntity.instructor)
        : undefined,
      domainEntity.sections
        ? domainEntity.sections.map((section) =>
            this.sectionMapper.toPersistenceEntity(section),
          )
        : undefined,
      domainEntity.category
        ? this.categoryMapper.toPersistenceEntity(domainEntity.category)
        : undefined,
    );
  }
}

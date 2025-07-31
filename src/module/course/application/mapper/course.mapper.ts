import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { User } from '@iam/user/domain/user.entity';
import { UserEntity } from '@iam/user/infrastructure/database/user.entity';

import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { Category } from '@category/domain/category.entity';
import { CategoryEntity } from '@category/infrastructure/database/category.entity';

import { Section } from '@module/section/domain/section.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

export class CourseMapper implements IEntityMapper<Course, CourseEntity> {
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
      entity.instructor as User,
      entity.sections as Section[],
      entity.category as Category,
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
      domainEntity.instructor as UserEntity,
      domainEntity.sections as SectionEntity[],
      domainEntity.category as CategoryEntity,
    );
  }
}

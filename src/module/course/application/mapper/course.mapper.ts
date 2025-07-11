import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { Course } from '@module/course/domain/course.entity';
import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { User } from '@module/iam/user/domain/user.entity';
import { UserEntity } from '@module/iam/user/infrastructure/database/user.entity';

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
    );
  }
}

import { EntitySchema } from 'typeorm';

import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Course } from '@module/course/domain/course.entity';

export const CourseSchema = new EntitySchema<Course>({
  name: 'Course',
  target: Course,
  tableName: 'course',
  columns: withBaseSchemaColumns({
    title: {
      type: String,
    },
    description: {
      type: String,
      nullable: true,
    },
    price: {
      type: 'decimal',
      precision: 2,
      nullable: true,
    },
    imageUrl: {
      type: String,
      nullable: true,
    },
    status: {
      type: String,
      default: PublishStatus.drafted,
    },
    slug: {
      type: String,
      nullable: true,
      unique: true,
    },
    difficulty: {
      type: String,
      nullable: true,
    },
  }),
});

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
      length: 100,
      nullable: true,
    },
    description: {
      type: String,
      length: 2000,
      nullable: true,
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true,
      transformer: {
        to: (value: number | null) => value,
        from: (value: string | null) => (value ? parseFloat(value) : null),
      },
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
    instructorId: {
      type: 'uuid',
    },
  }),
  relations: {
    instructor: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'instructor_id',
      },
    },
    sections: {
      type: 'one-to-many',
      target: 'Section',
      cascade: ['soft-remove'],
      inverseSide: 'course',
    },
  },
});

import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Section } from '@module/section/domain/section.entity';

export const SectionSchema = new EntitySchema<Section>({
  name: 'Section',
  target: Section,
  tableName: 'section',
  columns: withBaseSchemaColumns({
    title: {
      type: String,
      nullable: true,
    },
    description: {
      type: String,
      nullable: true,
    },
    position: {
      type: Number,
      nullable: true,
    },
    courseId: {
      type: 'uuid',
    },
  }),
  relations: {
    course: {
      type: 'many-to-one',
      target: 'Course',
      joinColumn: {
        name: 'course_id',
      },
    },
    lessons: {
      type: 'one-to-many',
      target: 'Lesson',
      cascade: ['soft-remove'],
      inverseSide: 'section',
    },
  },
});

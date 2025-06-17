import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Lesson } from '@module/lesson/domain/lesson.entity';

export const LessonSchema = new EntitySchema<Lesson>({
  name: 'Lesson',
  target: Lesson,
  tableName: 'lesson',
  columns: withBaseSchemaColumns({
    courseId: {
      type: 'uuid',
    },
    sectionId: {
      type: 'uuid',
    },
    title: {
      type: String,
      nullable: true,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    url: {
      type: String,
      nullable: true,
    },
    lessonType: {
      type: String,
      nullable: true,
    },
  }),
  relations: {
    section: {
      type: 'many-to-one',
      target: 'Section',
      joinColumn: {
        name: 'section_id',
      },
      inverseSide: 'lessons',
    },
  },
});

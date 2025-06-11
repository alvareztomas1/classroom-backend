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
});

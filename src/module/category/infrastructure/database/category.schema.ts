import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Category } from '@module/category/domain/category.entity';

export const CategorySchema = new EntitySchema<Category>({
  name: Category.name,
  target: Category,
  tableName: 'category',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
      length: 60,
    },
  }),
});

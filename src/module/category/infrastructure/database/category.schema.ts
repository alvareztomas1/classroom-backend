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
  relations: {
    parent: {
      type: 'many-to-one',
      target: Category.name,
      nullable: true,
      inverseSide: 'subCategories',
    },
    subCategories: {
      type: 'one-to-many',
      target: Category.name,
      inverseSide: 'parent',
      cascade: ['soft-remove'],
    },
  },
  uniques: [
    {
      name: 'UQ_CATEGORY_PARENT_NAME',
      columns: ['name', 'parent'],
    },
  ],
});

import { Column, Entity, Tree, TreeChildren, TreeParent } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { Category } from '@module/category/domain/category.entity';

@Entity('category')
@Tree('closure-table')
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  name!: string;

  @TreeParent()
  parent!: Category | null;

  @TreeChildren({
    cascade: ['soft-remove'],
  })
  children!: Category[];
}

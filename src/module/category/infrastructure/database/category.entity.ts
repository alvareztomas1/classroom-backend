import {
  Column,
  Entity,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { Category } from '@module/category/domain/category.entity';

@Entity('category')
@Tree('closure-table')
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 60 })
  name: string;

  @TreeParent()
  parent?: Category;

  @TreeChildren({
    cascade: ['soft-remove'],
  })
  children?: Category[];

  @OneToMany(() => CourseEntity, (course) => course.category)
  courses?: CourseEntity[];

  constructor(
    name: string,
    id?: string,
    parent?: Category,
    children?: Category[],
  ) {
    super(id);

    this.name = name;
    this.parent = parent;
    this.children = children;
  }
}

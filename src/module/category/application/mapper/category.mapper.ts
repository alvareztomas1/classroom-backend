import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { Category } from '@module/category/domain/category.entity';
import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';

export class CategoryMapper implements IEntityMapper<Category, CategoryEntity> {
  toDomainEntity(entity: CategoryEntity): Category {
    const { id, name, parent, children } = entity;

    return new Category(name, id, parent, children);
  }

  toPersistenceEntity(entity: Category): CategoryEntity {
    const { id, name, parent, children } = entity;

    return new CategoryEntity(name, id, parent, children);
  }
}

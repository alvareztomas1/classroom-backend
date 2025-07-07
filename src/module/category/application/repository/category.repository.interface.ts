import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Category } from '@module/category/domain/category.entity';

export const CATEGORY_REPOSITORY_KEY = 'category_repository';
export const CATEGORY_TREE_REPOSITORY_KEY = 'category_tree_repository';

export interface CategoryWithAncestors extends Category {
  ancestors?: Category[];
}

export interface ICategoryRepository extends BaseRepository<Category> {
  getOneByIdOrFail(
    id: string,
    include?: (keyof Category)[],
  ): Promise<CategoryWithAncestors>;
}

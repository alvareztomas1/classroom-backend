import { ICollection } from '@common/base/application/dto/collection.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Category } from '@module/category/domain/category.entity';
import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';

export const CATEGORY_REPOSITORY_KEY = 'category_repository';
export const CATEGORY_TREE_REPOSITORY_KEY = 'category_tree_repository';

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface ICategoryRepository
  extends BaseRepository<Category, CategoryEntity> {
  getOneByIdOrFail(id: string, include?: (keyof Category)[]): Promise<Category>;
  getChildrenByIdOrFail(id: string): Promise<CategoryWithChildren>;
  getCategoriesRoot(): Promise<ICollection<Category>>;
}

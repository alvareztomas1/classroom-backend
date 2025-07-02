import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Category } from '@module/category/domain/category.entity';

export const CATEGORY_REPOSITORY_KEY = 'category_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICategoryRepository extends BaseRepository<Category> {}

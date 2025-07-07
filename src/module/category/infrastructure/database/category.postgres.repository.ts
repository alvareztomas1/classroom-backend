import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import {
  CATEGORY_TREE_REPOSITORY_KEY,
  CategoryWithAncestors,
  ICategoryRepository,
} from '@module/category/application/repository/category.repository.interface';
import { Category } from '@module/category/domain/category.entity';
import { CategoryEntity } from '@module/category/infrastructure/database/category.schema';
import { CategoryAlreadyExistsException } from '@module/category/infrastructure/database/exception/category-alredy-exists.exception';

@Injectable()
export class CategoryPostgresRepository
  extends BaseRepository<Category>
  implements ICategoryRepository
{
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CATEGORY_TREE_REPOSITORY_KEY)
    private readonly treeRepository: TreeRepository<Category>,
  ) {
    super(categoryRepository);
  }

  async getOneById(id: string): Promise<Category | null> {
    return await this.treeRepository.findOne({
      where: { id },
    });
  }

  async getOneByIdOrFail(id: string): Promise<CategoryWithAncestors> {
    const category = await this.getOneById(id);

    if (!category) {
      throw new EntityNotFoundException(id);
    }

    const categoryWithAncestors =
      await this.treeRepository.findAncestorsTree(category);

    return {
      ...category,
      ancestors: this.buildPathFromTree(categoryWithAncestors),
    };
  }

  async saveOne(entity: Category): Promise<Category> {
    const existingCategory = await this.findExistingCategory(
      entity.name,
      entity.parent?.id,
    );

    if (existingCategory) {
      throw new CategoryAlreadyExistsException(
        entity.name,
        !existingCategory.parent,
        existingCategory.parent?.name,
      );
    }

    return await this.categoryRepository.save(entity);
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    const category = await this.treeRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new EntityNotFoundException(id);
    }

    const categoryWithDescendants =
      await this.treeRepository.findDescendantsTree(category);

    await this.repository.softRemove(categoryWithDescendants);
  }

  private async findExistingCategory(
    name: string,
    parentId?: string,
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        name,
        parent: parentId ? { id: parentId } : IsNull(),
      },
      relations: ['parent'],
    });
  }

  private buildPathFromTree(node: Category): Category[] {
    const path: Category[] = [];
    let current: Category | null | undefined = node;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }
}

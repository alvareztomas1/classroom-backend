import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { CategoryMapper } from '@module/category/application/mapper/category.mapper';
import {
  CATEGORY_TREE_REPOSITORY_KEY,
  CategoryWithAncestors,
  CategoryWithChildren,
  ICategoryRepository,
} from '@module/category/application/repository/category.repository.interface';
import { Category } from '@module/category/domain/category.entity';
import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';
import { CategoryAlreadyExistsException } from '@module/category/infrastructure/database/exception/category-alredy-exists.exception';

@Injectable()
export class CategoryPostgresRepository
  extends BaseRepository<Category, CategoryEntity>
  implements ICategoryRepository
{
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @Inject(CATEGORY_TREE_REPOSITORY_KEY)
    private readonly treeRepository: TreeRepository<CategoryEntity>,
    private readonly categoryMapper: CategoryMapper,
  ) {
    super(categoryRepository, categoryMapper);
  }

  async getCategoriesRoot(): Promise<ICollection<Category>> {
    const categories = await this.treeRepository.findRoots();

    return {
      data: categories.map((category) =>
        this.categoryMapper.toDomainEntity(category),
      ),
    };
  }

  async getChildrenByIdOrFail(id: string): Promise<CategoryWithChildren> {
    const category = await this.getOneById(id);

    if (!category) {
      throw new EntityNotFoundException(id);
    }

    const children = await this.findChildren(id);

    return {
      ...category,
      children,
    };
  }

  async getOneById(id: string): Promise<Category | null> {
    const category = await this.treeRepository.findOne({
      where: { id },
    });

    return category ? this.categoryMapper.toDomainEntity(category) : null;
  }

  async getOneByIdOrFail(id: string): Promise<CategoryWithAncestors> {
    const category = await this.getOneEntityById(id);

    if (!category) {
      throw new EntityNotFoundException(id);
    }

    const categoryWithAncestors =
      await this.treeRepository.findAncestorsTree(category);

    return {
      ...this.categoryMapper.toDomainEntity(category),
      ancestors: this.buildPathFromTree(
        this.categoryMapper.toDomainEntity(categoryWithAncestors),
      ),
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

  async getOneEntityById(id: string): Promise<CategoryEntity | null> {
    return await this.treeRepository.findOne({ where: { id } });
  }

  private async findExistingCategory(
    name: string,
    parentId?: string,
  ): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({
      where: {
        name,
        parent: parentId ? { id: parentId } : IsNull(),
      },
      relations: ['parent'],
    });

    return category ? this.categoryMapper.toDomainEntity(category) : null;
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

  private async findChildren(parentId: string): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { parent: { id: parentId } },
    });

    return categories.map((category) =>
      this.categoryMapper.toDomainEntity(category),
    );
  }
}

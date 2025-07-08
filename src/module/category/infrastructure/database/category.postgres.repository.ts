import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository, TreeRepository } from 'typeorm';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/base/application/constant/base.constants';
import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import {
  CATEGORY_TREE_REPOSITORY_KEY,
  CategoryWithAncestors,
  CategoryWithChildren,
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
  async getAll(
    options: IGetAllOptions<Category>,
  ): Promise<ICollection<Category>> {
    const { filter = {}, page, sort, fields } = options;
    const where = this.buildCategoryFilter(filter);

    const [items, itemCount] = await this.categoryRepository.findAndCount({
      where,
      order: sort,
      select: fields as (keyof Category)[],
      take: page?.size,
      skip: page?.offset,
    });

    return {
      data: items,
      pageNumber: page?.number || DEFAULT_PAGE_NUMBER,
      pageSize: page?.size || DEFAULT_PAGE_SIZE,
      pageCount: Math.ceil(itemCount / (page?.size || DEFAULT_PAGE_SIZE)),
      itemCount,
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

  private buildCategoryFilter(
    filter: Partial<Record<string, unknown>>,
  ): FindOptionsWhere<Category> {
    const { parentId, ...rest } = filter;

    const where: FindOptionsWhere<Category> = { ...rest };

    if (parentId === 'null') {
      where.parent = IsNull();
    } else if (typeof parentId === 'string') {
      where.parent = { id: parentId };
    }

    return where;
  }

  private async findChildren(parentId: string): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parent: { id: parentId } },
    });
  }
}

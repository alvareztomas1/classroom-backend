import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { Category } from '@module/category/domain/category.entity';
import { CategorySchema } from '@module/category/infrastructure/database/category.schema';
import { CategoryAlreadyExistsException } from '@module/category/infrastructure/database/exception/category-alredy-exists.exception';

@Injectable()
export class CategoryPostgresRepository extends BaseRepository<Category> {
  constructor(
    @InjectRepository(CategorySchema)
    private readonly categoryRepository: Repository<Category>,
  ) {
    super(categoryRepository);
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
    const category = await this.repository.findOne({
      where: { id },
      relations: ['subCategories'],
    });

    if (!category) {
      throw new EntityNotFoundException(id);
    }

    await this.repository.softRemove(category);
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
}

import { Inject, Injectable } from '@nestjs/common';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CategoryMapper } from '@module/category/application/mapper/category.mapper';
import {
  CATEGORY_REPOSITORY_KEY,
  ICategoryRepository,
} from '@module/category/application/repository/category.repository.interface';
import { Category } from '@module/category/domain/category.entity';

@Injectable()
export class CategoryCRUDService extends BaseCRUDService<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto
> {
  constructor(
    @Inject(CATEGORY_REPOSITORY_KEY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly categoryMapper: CategoryMapper,
  ) {
    super(categoryRepository, categoryMapper, Category.getEntityName());
  }

  async saveOne(createDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { parentId } = createDto;

    createDto.parent = parentId
      ? await this.categoryRepository.getOneByIdOrFail(parentId)
      : undefined;

    return super.saveOne(createDto);
  }

  async updateOne(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const { parentId } = updateDto;

    updateDto.parent = parentId
      ? await this.categoryRepository.getOneByIdOrFail(parentId)
      : undefined;

    return super.updateOne(id, updateDto);
  }
}

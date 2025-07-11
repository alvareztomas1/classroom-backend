import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CategoryDtoMapper } from '@module/category/application/mapper/category-dto.mapper';
import {
  CATEGORY_REPOSITORY_KEY,
  ICategoryRepository,
} from '@module/category/application/repository/category.repository.interface';
import { Category } from '@module/category/domain/category.entity';
import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';

@Injectable()
export class CategoryCRUDService extends BaseCRUDService<
  Category,
  CategoryEntity,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto
> {
  constructor(
    @Inject(CATEGORY_REPOSITORY_KEY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly categoryDtoMapper: CategoryDtoMapper,
  ) {
    super(categoryRepository, categoryDtoMapper, Category.getEntityName());
  }

  async getCategoriesRoot(): Promise<CollectionDto<CategoryResponseDto>> {
    const categories = await this.categoryRepository.getCategoriesRoot();

    return new CollectionDto({
      data: categories.data.map((category) =>
        this.categoryDtoMapper.fromEntityToResponseDto(category),
      ),
    });
  }

  async getChildrenByIdOrFail(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.getChildrenByIdOrFail(id);
    const categoryResponseDto =
      this.categoryDtoMapper.fromEntityToResponseDto(category);

    return categoryResponseDto;
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

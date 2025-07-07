import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CategoryWithAncestors } from '@module/category/application/repository/category.repository.interface';
import { Category } from '@module/category/domain/category.entity';

export class CategoryMapper
  implements
    Omit<
      IDtoMapper<
        Category,
        CreateCategoryDto,
        UpdateCategoryDto,
        CategoryResponseDto
      >,
      'fromEntityToResponseDto'
    >
{
  fromCreateDtoToEntity(dto: CreateCategoryDto): Category {
    const { id, name, parent, subCategories } = dto;

    return new Category(name, id, parent, subCategories);
  }

  fromUpdateDtoToEntity(entity: Category, dto: UpdateCategoryDto): Category {
    const { id, parent, subCategories } = entity;

    return new Category(dto.name ?? entity.name, id, parent, subCategories);
  }

  fromEntityToResponseDto(entity: CategoryWithAncestors): CategoryResponseDto {
    const { name, id, ancestors } = entity;

    return new CategoryResponseDto(
      Category.getEntityName(),
      name,
      id,
      ancestors,
    );
  }
}

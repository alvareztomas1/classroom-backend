import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { CategoryResponseDto } from '@category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@category/application/dto/update-category.dto';
import { CategoryWithChildren } from '@category/application/repository/category.repository.interface';
import { Category } from '@category/domain/category.entity';

export class CategoryDtoMapper
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
    const { id, name, parent, children } = dto;

    return new Category(name, id, parent, children);
  }

  fromUpdateDtoToEntity(entity: Category, dto: UpdateCategoryDto): Category {
    const { id, parent, children } = entity;

    return new Category(dto.name ?? entity.name, id, parent, children);
  }

  fromEntityToResponseDto(
    entity: Category | CategoryWithChildren,
  ): CategoryResponseDto {
    const { name, id, parent, children } = entity;

    return new CategoryResponseDto(
      Category.getEntityName(),
      name,
      id,
      parent ? this.buildCategoryPath(parent) : undefined,
      children,
    );
  }

  private buildCategoryPath(category: Category): Category {
    const categoryPath = {
      id: category.id,
      name: category.name,
    } as Category;

    if (category.parent) {
      categoryPath.parent = this.buildCategoryPath(category.parent);
    }

    return categoryPath;
  }
}

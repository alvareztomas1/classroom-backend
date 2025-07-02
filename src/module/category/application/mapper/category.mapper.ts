import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { Category } from '@module/category/domain/category.entity';

export class CategoryMapper
  implements
    IDtoMapper<
      Category,
      CreateCategoryDto,
      UpdateCategoryDto,
      CategoryResponseDto
    >
{
  fromCreateDtoToEntity(dto: CreateCategoryDto): Category {
    const { id, name } = dto;

    return new Category(name, id);
  }

  fromUpdateDtoToEntity(entity: Category, dto: UpdateCategoryDto): Category {
    const { id } = entity;

    return new Category(dto.name ?? entity.name, id);
  }

  fromEntityToResponseDto(entity: Category): CategoryResponseDto {
    const { name, id } = entity;

    return new CategoryResponseDto(Category.getEntityName(), name, id);
  }
}

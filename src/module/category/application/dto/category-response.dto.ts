import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { Category } from '@module/category/domain/category.entity';

export type RelatedCategory = Pick<Category, 'name' | 'id'>;

export class CategoryResponseDto extends BaseResponseDto {
  name: string;
  parent?: Category;
  subCategories?: Category[];

  constructor(
    type: string,
    name: string,
    id?: string,
    parent?: Category,
    subCategories?: Category[],
  ) {
    super(type, id);

    this.name = name;
    this.parent = parent ? this.buildRelatedCategory(parent) : undefined;
    this.subCategories = subCategories?.map((category) =>
      this.buildRelatedCategory(category),
    );
  }

  private buildRelatedCategory(category: Category): RelatedCategory {
    const { name, id } = category;

    return {
      id,
      name,
    };
  }
}

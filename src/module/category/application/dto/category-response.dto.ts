import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { Category } from '@category/domain/category.entity';

export type RelatedCategory = Pick<Category, 'name' | 'id'>;

export class CategoryResponseDto extends BaseResponseDto {
  name: string;
  parent?: Category;
  children?: Category[];

  constructor(
    type: string,
    name: string,
    id?: string,
    parent?: Category,
    children?: Category[],
  ) {
    super(type, id);

    this.name = name;
    this.parent = parent;
    this.children = children?.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  }
}

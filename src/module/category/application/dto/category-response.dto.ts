import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { Category } from '@module/category/domain/category.entity';

export type RelatedCategory = Pick<Category, 'name' | 'id'>;

export class CategoryResponseDto extends BaseResponseDto {
  name: string;
  path?: RelatedCategory[];

  constructor(type: string, name: string, id?: string, ancestors?: Category[]) {
    super(type, id);

    this.name = name;
    this.path = ancestors?.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  }
}

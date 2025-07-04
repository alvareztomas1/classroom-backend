import { Base } from '@common/base/domain/base.entity';

export class Category extends Base {
  name: string;
  parent?: Category;
  subCategories?: Category[];

  constructor(
    name: string,
    id?: string,
    parent?: Category,
    subCategories?: Category[],
  ) {
    super(id);

    this.name = name;
    this.parent = parent;
    this.subCategories = subCategories;
  }
}

import { Base } from '@common/base/domain/base.entity';

export class Category extends Base {
  name: string;

  constructor(name: string, id?: string) {
    super(id);

    this.name = name;
  }
}

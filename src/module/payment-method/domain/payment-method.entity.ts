import { Base } from '@common/base/domain/base.entity';

export class PaymentMethod extends Base {
  name: string;

  constructor(
    name: string,
    id?: string,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.name = name;
  }
}

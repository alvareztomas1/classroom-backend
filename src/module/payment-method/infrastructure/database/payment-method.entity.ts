import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

@Entity('payment_method')
export class PaymentMethodEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  name: string;

  constructor(name: string, id?: string) {
    super(id);

    this.name = name;
  }
}

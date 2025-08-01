import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { PurchaseEntity } from '@purchase/infrastructure/database/purchase.entity';

@Entity('payment_method')
export class PaymentMethodEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  name: string;

  @OneToMany(() => PurchaseEntity, (purchase) => purchase.paymentMethod)
  purchases?: PurchaseEntity[];

  constructor(
    name: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date,
  ) {
    super(id, createdAt, updatedAt, deletedAt);

    this.name = name;
  }
}

import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

@Entity('payment_method')
export class PaymentMethodEntity extends BaseEntity {
  static override get domainClass(): typeof PaymentMethod {
    return PaymentMethod;
  }

  @Column({ type: 'varchar', length: 20, unique: true })
  name!: string;
}

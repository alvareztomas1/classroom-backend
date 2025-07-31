import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

@Entity('purchase')
export class PurchaseEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  courseId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  amount: number;

  @Column({ type: 'varchar' })
  status: PurchaseStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentTransactionId?: string;

  @Column({ type: 'varchar', nullable: true })
  refundTransactionId?: string;

  constructor(
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    paymentTransactionId?: string,
    refundTransactionId?: string,
    id?: string,
  ) {
    super(id);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.paymentTransactionId = paymentTransactionId;
    this.refundTransactionId = refundTransactionId;
  }
}

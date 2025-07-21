import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { PurchaseStatus } from '@module/purchase/domain/purchase.status.enum';

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
  externalId?: string;

  constructor(
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    externalId?: string,
    id?: string,
  ) {
    super(id);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.externalId = externalId;
  }
}

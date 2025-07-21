import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { PurchaseStatus } from '@module/purchase/domain/purchase.status.enum';

export class PurchaseResponseDto extends BaseResponseDto {
  userId: string;
  courseId: string;
  amount: number;
  status: PurchaseStatus;
  externalId?: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(
    type: string,
    userId: string,
    courseId: string,
    amount: number,
    status: PurchaseStatus,
    externalId?: string,
    id?: string,
    createdAt?: string,
    updatedAt?: string,
  ) {
    super(type, id);

    this.userId = userId;
    this.courseId = courseId;
    this.amount = amount;
    this.status = status;
    this.externalId = externalId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

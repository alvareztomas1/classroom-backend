import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

export class WebhookEventResponseDto extends BaseResponseDto {
  message: string;
  processed: boolean;
  purchaseStatus: PurchaseStatus;

  constructor(
    type: string,
    message: string,
    processed: boolean,
    purchaseStatus: PurchaseStatus,
  ) {
    super(type);

    this.message = message;
    this.processed = processed;
    this.purchaseStatus = purchaseStatus;
  }
}

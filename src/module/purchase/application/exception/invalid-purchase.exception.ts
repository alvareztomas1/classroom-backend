import { BadRequestException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class InvalidPurchaseException extends BadRequestException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

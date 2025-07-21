import { ConflictException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class PurchaseAlreadyExists extends ConflictException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

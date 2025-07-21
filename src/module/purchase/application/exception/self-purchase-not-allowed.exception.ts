import { ForbiddenException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class SelfPurchaseNotAllowedException extends ForbiddenException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

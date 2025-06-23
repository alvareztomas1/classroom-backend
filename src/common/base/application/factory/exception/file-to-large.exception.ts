import { PayloadTooLargeException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class FileTooLargeException extends PayloadTooLargeException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

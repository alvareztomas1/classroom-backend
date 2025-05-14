import { UnauthorizedException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class CodeMismatchException extends UnauthorizedException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

import { InternalServerErrorException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class CouldNotSignUpException extends InternalServerErrorException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

import { NotFoundException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class UserNotFoundException extends NotFoundException {
  constructor(params: IBaseErrorInfo) {
    super(params);
  }
}

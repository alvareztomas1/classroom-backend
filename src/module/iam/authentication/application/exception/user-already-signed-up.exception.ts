import { BadRequestException } from '@nestjs/common';

import { IBaseErrorInfo } from '@common/base/application/exception/app-error-response.interface';

export class UserAlreadySignedUp extends BadRequestException {
  constructor(params: IBaseErrorInfo) {
    const title = params.title ?? 'Signup Conflict';
    super({ ...params, title });
  }
}

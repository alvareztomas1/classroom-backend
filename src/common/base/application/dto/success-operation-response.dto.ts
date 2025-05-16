import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

export class SuccessOperationResponseDto
  extends BaseResponseDto
  implements ISuccessfulOperationResponse
{
  id?: string;
  message: string;
  success: boolean;
  type: string;

  constructor(message: string, success: boolean, type: string, id?: string) {
    super(type, id);
    this.message = message;
    this.success = success;
  }
}

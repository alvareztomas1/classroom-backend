import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

export class PaymentMethodResponseDto extends BaseResponseDto {
  name: string;

  constructor(type: string, name: string, id?: string) {
    super(type, id);
    this.name = name;
  }
}

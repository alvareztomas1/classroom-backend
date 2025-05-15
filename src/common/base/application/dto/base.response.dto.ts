import { IResponseDto } from '@common/base/application/dto/dto.interface';

export class BaseResponseDto implements IResponseDto {
  type: string;
  id?: string;

  constructor(type: string, id?: string) {
    this.type = type;
    this.id = id;
  }
}

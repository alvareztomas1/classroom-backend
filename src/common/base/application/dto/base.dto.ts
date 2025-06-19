import { IDto } from '@common/base/application/dto/dto.interface';

export class BaseDto implements IDto {
  id!: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

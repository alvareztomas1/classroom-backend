import { IsOptional, IsString } from 'class-validator';

import { IDto } from '@common/base/application/dto/dto.interface';

export class BaseDto implements IDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsString()
  @IsOptional()
  deletedAt?: string;
}

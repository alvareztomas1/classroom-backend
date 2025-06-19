import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

export class SectionDto extends BaseDto {
  @IsUUID('4')
  @IsNotEmpty()
  courseId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

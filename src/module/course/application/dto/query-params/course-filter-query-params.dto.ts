import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

export class CourseFilterQueryParamsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  slug!: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus;

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

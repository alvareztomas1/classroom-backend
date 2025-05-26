import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';
import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

export class CourseDto extends BaseDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsEnum(PublishStatus)
  status: PublishStatus;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty: Difficulty;
}

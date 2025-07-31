import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

import { Section } from '@section/domain/section.entity';

import { LessonType } from '@lesson/domain/lesson.type';

export class LessonDto extends BaseDto {
  @IsNotEmpty()
  @IsUUID('4')
  courseId!: string;

  @IsNotEmpty()
  @IsUUID('4')
  sectionId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsEnum(LessonType)
  lessonType?: LessonType;

  section?: Section;
}

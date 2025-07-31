import { OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';

import { CourseDto } from '@course/application/dto/course.dto';

import { Category } from '@category/domain/category.entity';

export class CreateCourseDto extends CourseDto {
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  category?: Category;
}

export class CreateCourseRequestDto extends OmitType(CreateCourseDto, [
  'instructorId',
  'imageUrl',
]) {}

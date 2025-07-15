import { OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';

import { Category } from '@module/category/domain/category.entity';
import { CourseDto } from '@module/course/application/dto/course.dto';

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

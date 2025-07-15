import { OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';

import { CategoryWithAncestors } from '@module/category/application/repository/category.repository.interface';
import { CourseDto } from '@module/course/application/dto/course.dto';

export class CreateCourseDto extends CourseDto {
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;

  category?: CategoryWithAncestors;
}

export class CreateCourseRequestDto extends OmitType(CreateCourseDto, [
  'instructorId',
  'imageUrl',
]) {}

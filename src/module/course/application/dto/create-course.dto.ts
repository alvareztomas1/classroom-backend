import { OmitType } from '@nestjs/mapped-types';

import { CourseDto } from '@module/course/application/dto/course.dto';

export class CreateCourseRequestDto extends OmitType(CourseDto, [
  'instructorId',
  'imageUrl',
]) {}

export class CreateCourseDto extends CourseDto {}

import { OmitType } from '@nestjs/mapped-types';

import { CourseDto } from '@module/course/application/dto/course.dto';

export class CreateCourseRequestDto extends OmitType(CourseDto, [
  'instructorId',
]) {}

export class CreateCourseDto extends CourseDto {}

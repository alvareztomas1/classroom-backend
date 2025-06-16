import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['instructorId']),
) {
  instructorId?: string;
}

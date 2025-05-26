import { PartialType } from '@nestjs/mapped-types';

import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

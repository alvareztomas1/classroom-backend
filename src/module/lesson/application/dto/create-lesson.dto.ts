import { OmitType } from '@nestjs/mapped-types';

import { LessonDto } from '@lesson/application/dto/lesson.dto';

export class CreateLessonDtoQuery extends OmitType(LessonDto, [
  'courseId',
  'sectionId',
  'lessonType',
]) {}

export class CreateLessonDto extends LessonDto {}

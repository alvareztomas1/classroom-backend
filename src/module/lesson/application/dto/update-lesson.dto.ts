import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateLessonDto } from '@lesson/application/dto/create-lesson.dto';

export class UpdateLessonDto extends PartialType(
  OmitType(CreateLessonDto, ['courseId', 'sectionId']),
) {
  courseId!: string;
  sectionId!: string;
}

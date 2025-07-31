import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateSectionDto } from '@section/application/dto/create.section.dto';

export class UpdateSectionDto extends PartialType(
  OmitType(CreateSectionDto, ['courseId']),
) {
  courseId?: string;
}

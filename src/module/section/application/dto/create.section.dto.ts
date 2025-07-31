import { OmitType } from '@nestjs/mapped-types';

import { SectionDto } from '@section/application/dto/section.dto';

export class CreateSectionDtoQuery extends OmitType(SectionDto, ['courseId']) {}

export class CreateSectionDto extends SectionDto {}

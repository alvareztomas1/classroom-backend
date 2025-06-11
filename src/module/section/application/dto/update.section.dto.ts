import { PartialType } from '@nestjs/mapped-types';

import { CreateSectionDto } from '@module/section/application/dto/create.section.dto';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {}

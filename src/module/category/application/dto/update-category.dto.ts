import { PartialType } from '@nestjs/mapped-types';

import { CreateCategoryDto } from '@category/application/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

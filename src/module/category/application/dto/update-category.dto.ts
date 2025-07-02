import { PartialType } from '@nestjs/mapped-types';

import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

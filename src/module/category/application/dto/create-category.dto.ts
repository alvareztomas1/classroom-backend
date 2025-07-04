import { IsOptional, IsUUID } from 'class-validator';

import { CategoryDto } from '@module/category/application/dto/category.dto';

export class CreateCategoryDto extends CategoryDto {
  @IsOptional()
  @IsUUID('4')
  parentId?: string;
}

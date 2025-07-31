import { IsNotEmpty, IsString } from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

import { Category } from '@category/domain/category.entity';

export class CategoryDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  parent?: Category;

  subCategories?: Category[];

  children?: Category[];

  ancestors?: Category[];
}

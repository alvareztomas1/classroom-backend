import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Category } from '@module/category/domain/category.entity';

type CategoryRelations = IGetAllOptions<Category>['include'];

export class CategoryIncludeQueryDto {
  @IsIn(['parent', 'subCategories'], {
    each: true,
  })
  @IsOptional()
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  target?: CategoryRelations;
}

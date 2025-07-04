import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Category } from '@module/category/domain/category.entity';

type CategoryFields = IGetAllOptions<Category>['fields'];

export class CategoryFieldsQueryParamsDto {
  @IsIn(['id', 'name', 'createdAt', 'updatedAt', 'deletedAt'], {
    each: true,
  })
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  @IsOptional()
  target?: CategoryFields;
}

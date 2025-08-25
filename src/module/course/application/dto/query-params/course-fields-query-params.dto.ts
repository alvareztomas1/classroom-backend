import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Course } from '@course/domain/course.entity';

type CourseFields = IGetAllOptions<Course>['fields'];

export class CourseFieldsQueryParamsDto {
  @IsIn(
    [
      'id',
      'title',
      'description',
      'price',
      'imageUrl',
      'status',
      'slug',
      'difficulty',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ],
    {
      each: true,
    },
  )
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  @IsOptional()
  target?: CourseFields;
}

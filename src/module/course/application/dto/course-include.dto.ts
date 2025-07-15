import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Course } from '@module/course/domain/course.entity';

type CourseRelations = IGetAllOptions<Course>['include'];
export class CourseIncludeQueryDto {
  @IsIn(['instructor', 'category'], {
    each: true,
  })
  @IsOptional()
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  target?: CourseRelations;
}

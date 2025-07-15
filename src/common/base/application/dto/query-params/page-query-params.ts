import { IsInt, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/base/application/constant/base.constants';

export class PageQueryParamsDto {
  @IsInt()
  @Min(1)
  number: number = DEFAULT_PAGE_NUMBER;

  @IsInt()
  @Min(1)
  @Max(50)
  size: number = DEFAULT_PAGE_SIZE;

  get offset(): number {
    return (this.number - 1) * this.size;
  }
}

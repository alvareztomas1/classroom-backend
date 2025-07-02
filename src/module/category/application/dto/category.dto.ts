import { IsNotEmpty, IsString } from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';

export class CategoryDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

import { IsOptional, IsString } from 'class-validator';

export class CategoryFilterQueryParamsDto {
  @IsString()
  @IsOptional()
  name?: string;
}

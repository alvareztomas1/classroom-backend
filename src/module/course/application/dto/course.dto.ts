import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';
import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

import { User } from '@module/iam/user/domain/user.entity';

export class CourseDto extends BaseDto {
  @IsNotEmpty()
  @IsUUID('4')
  instructorId!: string;

  @IsOptional()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Description cannot be longer than 2000 characters',
  })
  description?: string;

  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    { message: 'Price must be a number with 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  @Max(10000, { message: 'Price cannot exceed $10,000' })
  price?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(PublishStatus, {
    message: `Status must be one of: ${Object.values(PublishStatus).join(', ')}`,
  })
  status?: PublishStatus;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(Difficulty, {
    message: `Difficulty must be one of: ${Object.values(Difficulty).join(', ')}`,
  })
  difficulty?: Difficulty;

  instructor?: User;
}

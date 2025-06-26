import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { BaseDto } from '@common/base/application/dto/base.dto';
import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

import { User } from '@module/iam/user/domain/user.entity';

export class CourseDto extends BaseDto {
  @IsNotEmpty()
  @IsUUID('4')
  instructorId!: string;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  @IsString()
  title?: string;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsString()
  @MaxLength(2000, {
    message: 'Description cannot be longer than 2000 characters',
  })
  description?: string;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    { message: 'Price must be a number with 2 decimal places' },
  )
  @Min(0, { message: 'Price cannot be negative' })
  @Max(10000, { message: 'Price cannot exceed $10,000' })
  price?: number;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsUrl()
  imageUrl?: string;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsEnum(PublishStatus, {
    message: `Status must be one of: ${Object.values(PublishStatus).join(', ')}`,
  })
  status?: PublishStatus = PublishStatus.drafted;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsString()
  slug?: string;

  @ValidateIf((o: CourseDto) => o.status === PublishStatus.published)
  @IsEnum(Difficulty, {
    message: `Difficulty must be one of: ${Object.values(Difficulty).join(', ')}`,
  })
  difficulty?: Difficulty;

  instructor?: User;
}

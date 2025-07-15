import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

import { Category } from '@module/category/domain/category.entity';
import { User } from '@module/iam/user/domain/user.entity';

export type CourseResponseInstructor = Pick<
  User,
  'firstName' | 'lastName' | 'avatarUrl'
>;

export class CourseResponseDto extends BaseResponseDto {
  instructorId: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  status?: PublishStatus;
  slug?: string;
  difficulty?: Difficulty;
  instructor?: CourseResponseInstructor;
  category?: Category;

  constructor(
    type: string,
    instructorId: string,
    title?: string,
    description?: string,
    price?: number,
    imageUrl?: string,
    status?: PublishStatus,
    slug?: string,
    difficulty?: Difficulty,
    instructor?: CourseResponseInstructor,
    id?: string,
    category?: Category,
  ) {
    super(type, id);

    this.instructorId = instructorId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.status = status;
    this.slug = slug;
    this.difficulty = difficulty;
    if (instructor) {
      this.instructor = instructor;
    }
    this.category = category;
  }
}

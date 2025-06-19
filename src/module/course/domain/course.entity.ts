import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { Base } from '@common/base/domain/base.entity';

import { User } from '@module/iam/user/domain/user.entity';

export class Course extends Base {
  instructorId: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  status?: PublishStatus;
  slug?: string;
  difficulty?: Difficulty;
  instructor?: User;

  constructor(
    instructorId: string,
    id?: string,
    title?: string,
    description?: string,
    price?: number,
    imageUrl?: string,
    slug?: string,
    difficulty?: Difficulty,
    status?: PublishStatus,
    instructor?: User,
  ) {
    super(id);
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.status = status;
    this.slug = slug;
    this.difficulty = difficulty;
    this.instructorId = instructorId;
    this.instructor = instructor;
  }
}

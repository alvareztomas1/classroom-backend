import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { Base } from '@common/base/domain/base.entity';

import { User } from '@module/iam/user/domain/user.entity';

export class Course extends Base {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: PublishStatus;
  slug: string;
  difficulty: Difficulty;
  instructor?: User;

  get instructorId(): string | null {
    return this.instructor?.id || null;
  }

  constructor(
    id: string,
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    status: PublishStatus,
    slug: string,
    difficulty: Difficulty,
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
    this.instructor = instructor;
  }
}

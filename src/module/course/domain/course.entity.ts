import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

import { Category } from '@category/domain/category.entity';

import { Section } from '@module/section/domain/section.entity';

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
  sections?: Section[];
  category?: Category;

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
    sections?: Section[],
    category?: Category,
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
    this.sections = sections;
    this.category = category;
  }
}

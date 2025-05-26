import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { Base } from '@common/base/domain/base.entity';

export class Course extends Base {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: PublishStatus;
  slug: string;

  constructor(
    id: string,
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    status: PublishStatus,
    slug: string,
  ) {
    super(id);
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.status = status;
    this.slug = slug;
  }
}

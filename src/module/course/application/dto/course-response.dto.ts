import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';

export class CourseResponseDto extends BaseResponseDto {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: PublishStatus;
  slug: string;
  constructor(
    type: string,
    title: string,
    description: string,
    price: number,
    imageUrl: string,
    status: PublishStatus,
    slug: string,
    id?: string,
  ) {
    super(type, id);

    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.status = status;
    this.slug = slug;
  }
}

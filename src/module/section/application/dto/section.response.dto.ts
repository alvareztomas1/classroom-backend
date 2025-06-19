import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

export class SectionResponseDto extends BaseResponseDto {
  courseId: string;
  title?: string;
  description?: string;
  position?: number;

  constructor(
    type: string,
    courseId: string,
    title?: string,
    description?: string,
    position?: number,
    id?: string,
  ) {
    super(type, id);
    this.title = title;
    this.description = description;
    this.position = position;
    this.courseId = courseId;
  }
}

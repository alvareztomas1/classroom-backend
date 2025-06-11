import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

export class SectionResponseDto extends BaseResponseDto {
  title: string;
  description: string;
  position: number;
  courseId: string;

  constructor(
    type: string,
    title: string,
    description: string,
    position: number,
    courseId: string,
    id?: string,
  ) {
    super(type, id);
    this.title = title;
    this.description = description;
    this.position = position;
    this.courseId = courseId;
  }
}

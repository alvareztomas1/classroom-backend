import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

import { LessonType } from '@lesson/domain/lesson.type';

import { Section } from '@module/section/domain/section.entity';

export class LessonResponseDto extends BaseResponseDto {
  courseId: string;
  sectionId: string;
  title?: string;
  description?: string;
  url?: string;
  lessonType?: LessonType;
  section?: Section;

  constructor(
    type: string,
    courseId: string,
    sectionId: string,
    title?: string,
    description?: string,
    url?: string,
    lessonType?: LessonType,
    id?: string,
    section?: Section,
  ) {
    super(type, id);

    this.courseId = courseId;
    this.sectionId = sectionId;
    this.title = title;
    this.description = description;
    this.url = url;
    this.lessonType = lessonType;
    this.type = type;
    this.section = section;
  }
}

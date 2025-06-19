import { Base } from '@common/base/domain/base.entity';

import { LessonType } from '@module/lesson/domain/lesson.type';
import { Section } from '@module/section/domain/section.entity';

export class Lesson extends Base {
  courseId: string;
  sectionId: string;
  title?: string;
  description?: string;
  url?: string;
  section?: Section;
  lessonType?: LessonType;

  get instructorId(): string | undefined {
    return this.section?.instructorId;
  }

  constructor(
    courseId: string,
    sectionId: string,
    id?: string,
    title?: string,
    description?: string,
    url?: string,
    lessonType?: LessonType,
  ) {
    super(id);
    this.courseId = courseId;
    this.sectionId = sectionId;
    this.title = title;
    this.description = description;
    this.url = url;
    this.lessonType = lessonType;
  }
}

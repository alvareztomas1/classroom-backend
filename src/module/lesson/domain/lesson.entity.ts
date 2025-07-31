import { Base } from '@common/base/domain/base.entity';

import { Section } from '@section/domain/section.entity';

import { LessonType } from '@lesson/domain/lesson.type';

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
    section?: Section,
  ) {
    super(id);
    this.courseId = courseId;
    this.sectionId = sectionId;
    this.title = title;
    this.description = description;
    this.url = url;
    this.lessonType = lessonType;
    this.section = section;
  }
}

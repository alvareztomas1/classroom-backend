import { Base } from '@common/base/domain/base.entity';

import { Course } from '@course/domain/course.entity';

import { Lesson } from '@lesson/domain/lesson.entity';

export class Section extends Base {
  courseId: string;
  title?: string;
  description?: string;
  position?: number;
  course?: Course;
  lessons?: Lesson[];

  get instructorId(): string | undefined {
    return this.course?.instructorId;
  }

  constructor(
    courseId: string,
    title?: string,
    description?: string,
    position?: number,
    id?: string,
    course?: Course,
    lessons?: Lesson[],
  ) {
    super(id);
    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.position = position;
    this.course = course;
    this.lessons = lessons;
  }
}

import { Base } from '@common/base/domain/base.entity';

import { Course } from '@module/course/domain/course.entity';

export class Section extends Base {
  courseId: string;
  title: string;
  description: string;
  position: number;
  course?: Course;

  get instructorId(): string | undefined {
    return this.course?.instructorId;
  }

  constructor(
    id: string,
    courseId: string,
    title: string,
    description: string,
    position: number,
    course?: Course,
  ) {
    super(id);
    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.position = position;
    this.course = course;
  }
}

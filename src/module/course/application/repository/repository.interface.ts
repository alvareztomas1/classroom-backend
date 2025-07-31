import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

export const COURSE_REPOSITORY_KEY = 'course_repository';

export interface ICourseRepository
  extends BaseRepository<Course, CourseEntity> {
  getSlugsStartingWith(slug: string): Promise<string[]>;
}

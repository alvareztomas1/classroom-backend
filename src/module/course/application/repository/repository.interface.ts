import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Course } from '@module/course/domain/course.entity';

export const COURSE_REPOSITORY_KEY = 'course_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ICourseRepository extends BaseRepository<Course> {}

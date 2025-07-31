import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

export const LESSON_REPOSITORY_KEY = 'lesson_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILessonRepository
  extends BaseRepository<Lesson, LessonEntity> {}

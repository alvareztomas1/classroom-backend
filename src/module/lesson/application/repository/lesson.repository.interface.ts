import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Lesson } from '@module/lesson/domain/lesson.entity';

export const LESSON_REPOSITORY_KEY = 'lesson_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILessonRepository extends BaseRepository<Lesson> {}

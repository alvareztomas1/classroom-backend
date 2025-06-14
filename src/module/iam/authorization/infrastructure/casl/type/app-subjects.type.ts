import { InferSubjects } from '@casl/ability';

import { Course } from '@module/course/domain/course.entity';
import { User } from '@module/iam/user/domain/user.entity';

export type AppSubjects =
  | InferSubjects<typeof User | User | typeof Course | Course>
  | 'all';

import { InferSubjects } from '@casl/ability';

import { User } from '@module/iam/user/domain/user.entity';

export type AppSubjects = InferSubjects<typeof User | User> | 'all';

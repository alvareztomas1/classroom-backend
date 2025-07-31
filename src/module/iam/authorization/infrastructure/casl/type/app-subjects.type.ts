import { InferSubjects } from '@casl/ability';

import { User } from '@iam/user/domain/user.entity';

import { Course } from '@course/domain/course.entity';

import { Lesson } from '@lesson/domain/lesson.entity';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';
import { Purchase } from '@module/purchase/domain/purchase.entity';
import { Section } from '@module/section/domain/section.entity';

export type AppSubjects =
  | InferSubjects<
      | typeof User
      | User
      | typeof Course
      | Course
      | typeof Section
      | Section
      | typeof Lesson
      | Lesson
      | typeof PaymentMethod
      | PaymentMethod
      | typeof Purchase
      | Purchase
    >
  | 'all';

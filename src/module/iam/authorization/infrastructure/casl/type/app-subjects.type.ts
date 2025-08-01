import { InferSubjects } from '@casl/ability';

import { User } from '@iam/user/domain/user.entity';

import { Course } from '@course/domain/course.entity';

import { Category } from '@category/domain/category.entity';

import { Section } from '@section/domain/section.entity';

import { Lesson } from '@lesson/domain/lesson.entity';

import { PaymentMethod } from '@payment-method/domain/payment-method.entity';

import { Purchase } from '@purchase/domain/purchase.entity';

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
      | Category
      | typeof Category
    >
  | 'all';

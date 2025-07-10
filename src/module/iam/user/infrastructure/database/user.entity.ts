import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';
import { ArrayTransformer } from '@common/transformers/array.transformer';

import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { User } from '@module/iam/user/domain/user.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  static override get domainClass(): typeof User {
    return User;
  }

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  externalId?: string;

  @Column({ type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar' })
  lastName!: string;

  @Column({ type: 'varchar', transformer: new ArrayTransformer() })
  roles!: string[];

  @Column({ type: 'boolean', default: false })
  isVerified?: boolean;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  courses?: CourseEntity[];
}

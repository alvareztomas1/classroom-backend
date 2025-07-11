import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';
import { ArrayTransformer } from '@common/transformers/array.transformer';

import { CourseEntity } from '@module/course/infrastructure/database/course.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', transformer: new ArrayTransformer() })
  roles: string[];

  @Column({ type: 'varchar', unique: true, nullable: true })
  externalId?: string;

  @Column({ type: 'boolean', default: false })
  isVerified?: boolean;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  courses?: CourseEntity[];

  constructor(
    email: string,
    firstName: string,
    lastName: string,
    roles: string[],
    id?: string,
    externalId?: string,
    avatarUrl?: string,
    isVerified?: boolean,
  ) {
    super(id);

    this.email = email;
    this.externalId = externalId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.roles = roles;
    this.isVerified = isVerified;
    this.avatarUrl = avatarUrl;
  }
}

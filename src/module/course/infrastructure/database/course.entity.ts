import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { Course } from '@module/course/domain/course.entity';
import { UserEntity } from '@module/iam/user/infrastructure/database/user.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

@Entity('course')
export class CourseEntity extends BaseEntity {
  static override get domainClass(): typeof Course {
    return Course;
  }

  @Column({ type: 'varchar', length: 100, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  price?: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({
    type: 'varchar',
    default: PublishStatus.drafted,
  })
  status?: PublishStatus;

  @Column({ type: 'varchar', nullable: true, unique: true })
  slug?: string;

  @Column({ type: 'varchar', nullable: true })
  difficulty?: string;

  @Column({ type: 'uuid' })
  instructorId!: string;

  @ManyToOne(() => UserEntity, (user) => user.courses)
  instructor?: UserEntity;

  @OneToMany(() => SectionEntity, (section) => section.course, {
    cascade: ['soft-remove'],
  })
  sections?: SectionEntity[];
}

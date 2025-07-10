import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { LessonEntity } from '@module/lesson/infrastructure/database/lesson.entity';
import { Section } from '@module/section/domain/section.entity';

@Entity('section')
export class SectionEntity extends BaseEntity {
  static override get domainClass(): typeof Section {
    return Section;
  }

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  position?: number;

  @Column({ type: 'uuid' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.sections)
  course?: CourseEntity;

  @OneToMany(() => LessonEntity, (lesson) => lesson.section, {
    cascade: ['soft-remove'],
  })
  lessons?: LessonEntity[];

  get instructorId(): string | undefined {
    return this.course?.instructorId;
  }
}

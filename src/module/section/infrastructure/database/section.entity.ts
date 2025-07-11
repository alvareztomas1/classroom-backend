import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { LessonEntity } from '@module/lesson/infrastructure/database/lesson.entity';

@Entity('section')
export class SectionEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  courseId: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  position?: number;

  @ManyToOne(() => CourseEntity, (course) => course.sections)
  course?: CourseEntity;

  @OneToMany(() => LessonEntity, (lesson) => lesson.section, {
    cascade: ['soft-remove'],
  })
  lessons?: LessonEntity[];

  get instructorId(): string | undefined {
    return this.course?.instructorId;
  }

  constructor(
    courseId: string,
    id?: string,
    title?: string,
    description?: string,
    position?: number,
    course?: CourseEntity,
    lessons?: LessonEntity[],
  ) {
    super(id);

    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.position = position;
    this.course = course;
    this.lessons = lessons;
  }
}

import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { Lesson } from '@module/lesson/domain/lesson.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

@Entity('lesson')
export class LessonEntity extends BaseEntity {
  static override get domainClass(): typeof Lesson {
    return Lesson;
  }

  @Column({ type: 'uuid' })
  courseId!: string;

  @Column({ type: 'uuid' })
  sectionId!: string;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  url?: string;

  @Column({ type: 'varchar', nullable: true })
  lessonType?: string;

  @ManyToOne(() => SectionEntity, (section) => section.lessons)
  section?: SectionEntity;

  get instructorId(): string | undefined {
    return this.section?.instructorId;
  }
}

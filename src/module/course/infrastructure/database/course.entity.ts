import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

import { UserEntity } from '@iam/user/infrastructure/database/user.entity';

import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

@Entity('course')
export class CourseEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  instructorId: string;

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

  @ManyToOne(() => UserEntity, (user) => user.courses)
  instructor?: UserEntity;

  @OneToMany(() => SectionEntity, (section) => section.course, {
    cascade: ['soft-remove'],
  })
  sections?: SectionEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.courses)
  category?: CategoryEntity;

  constructor(
    instructorId: string,
    id?: string,
    title?: string,
    description?: string,
    price?: number,
    imageUrl?: string,
    status?: PublishStatus,
    slug?: string,
    difficulty?: string,
    instructor?: UserEntity,
    sections?: SectionEntity[],
    category?: CategoryEntity,
  ) {
    super(id);

    this.instructorId = instructorId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.status = status;
    this.slug = slug;
    this.difficulty = difficulty;
    this.instructor = instructor;
    this.sections = sections;
    this.category = category;
  }
}

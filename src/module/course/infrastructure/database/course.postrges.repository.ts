import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { titleCase } from 'change-case-all';
import { Repository, TreeRepository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { CourseMapper } from '@course/application/mapper/course.mapper';
import { ICourseRepository } from '@course/application/repository/repository.interface';
import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import { CATEGORY_TREE_REPOSITORY_KEY } from '@category/application/repository/category.repository.interface';
import { CategoryEntity } from '@category/infrastructure/database/category.entity';

@Injectable()
export class CoursePostgresRepository
  extends BaseRepository<Course, CourseEntity>
  implements ICourseRepository
{
  constructor(
    @InjectRepository(CourseEntity) repository: Repository<CourseEntity>,
    private readonly courseMapper: CourseMapper,
    @Inject(CATEGORY_TREE_REPOSITORY_KEY)
    private readonly categoryTreeRepository: TreeRepository<CategoryEntity>,
  ) {
    super(
      repository,
      courseMapper,
      titleCase(CourseEntity.name.replace('Entity', '')),
    );
  }

  async getOneById(
    id: string,
    include?: (keyof Course)[],
  ): Promise<Course | null> {
    const courseEntity = await this.repository.findOne({
      where: { id },
      relations: include,
    });

    if (courseEntity?.category) {
      const categoryWithAncestors =
        await this.categoryTreeRepository.findAncestorsTree(
          courseEntity.category,
        );
      courseEntity.category = categoryWithAncestors;
    }

    return courseEntity ? this.courseMapper.toDomainEntity(courseEntity) : null;
  }

  async getOneByIdOrFail(
    id: string,
    include?: (keyof Course)[],
  ): Promise<Course> {
    const entity = await this.getOneById(id, include);

    if (!entity) {
      throw new EntityNotFoundException('id', id, this.entityType);
    }

    return entity;
  }

  async getSlugsStartingWith(slug: string): Promise<string[]> {
    const results: { slug: string }[] = await this.repository
      .createQueryBuilder('course')
      .select('course.slug', 'slug')
      .where('course.slug LIKE :slug', { slug: `${slug}%` })
      .getRawMany();

    return results.map((r) => r.slug);
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    const course = await this.repository.findOne({
      where: { id },
      relations: ['sections', 'sections.lessons'],
    });

    if (!course) {
      throw new EntityNotFoundException('id', id, this.entityType);
    }

    await this.repository.softRemove(course);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { CourseMapper } from '@module/course/application/mapper/course.mapper';
import { ICourseRepository } from '@module/course/application/repository/repository.interface';
import { Course } from '@module/course/domain/course.entity';
import { CourseEntity } from '@module/course/infrastructure/database/course.entity';

@Injectable()
export class CoursePostgresRepository
  extends BaseRepository<Course, CourseEntity>
  implements ICourseRepository
{
  constructor(
    @InjectRepository(CourseEntity) repository: Repository<CourseEntity>,
    private readonly courseMapper: CourseMapper,
  ) {
    super(repository, courseMapper);
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
      throw new EntityNotFoundException(id);
    }

    await this.repository.softRemove(course);
  }
}

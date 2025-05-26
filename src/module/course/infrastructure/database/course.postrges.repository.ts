import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Course } from '@module/course/domain/course.entity';
import { CourseSchema } from '@module/course/infrastructure/database/course.schema';

@Injectable()
export class CoursePostgresRepository extends BaseRepository<Course> {
  constructor(@InjectRepository(CourseSchema) repository: Repository<Course>) {
    super(repository);
  }
}

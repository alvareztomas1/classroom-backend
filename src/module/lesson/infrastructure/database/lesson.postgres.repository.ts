import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { ILessonRepository } from '@module/lesson/application/repository/lesson.repository.interface';
import { Lesson } from '@module/lesson/domain/lesson.entity';
import { LessonSchema } from '@module/lesson/infrastructure/database/lesson.schema';

@Injectable()
export class LessonPostgresRepository
  extends BaseRepository<Lesson>
  implements ILessonRepository
{
  constructor(@InjectRepository(LessonSchema) repository: Repository<Lesson>) {
    super(repository);
  }
}

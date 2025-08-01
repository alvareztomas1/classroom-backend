import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { titleCase } from 'change-case-all';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { LessonMapper } from '@lesson/application/mapper/lesson.mapper';
import { ILessonRepository } from '@lesson/application/repository/lesson.repository.interface';
import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

@Injectable()
export class LessonPostgresRepository
  extends BaseRepository<Lesson, LessonEntity>
  implements ILessonRepository
{
  constructor(
    @InjectRepository(LessonEntity) repository: Repository<LessonEntity>,
    private readonly lessonMapper: LessonMapper,
  ) {
    super(
      repository,
      lessonMapper,
      titleCase(LessonEntity.name.replace('Entity', '')),
    );
  }
}

import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonMapper } from '@module/lesson/application/mapper/lesson.mapper';
import { LESSON_REPOSITORY_KEY } from '@module/lesson/application/repository/lesson.repository.interface';
import { LessonService } from '@module/lesson/application/service/lesson.service';
import { LessonPostgresRepository } from '@module/lesson/infrastructure/database/lesson.postgres.repository';
import { LessonSchema } from '@module/lesson/infrastructure/database/lesson.schema';
import { LessonController } from '@module/lesson/interface/lesson.controller';

const lessonRepositoryProvider: Provider = {
  provide: LESSON_REPOSITORY_KEY,
  useClass: LessonPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([LessonSchema])],
  providers: [LessonService, LessonMapper, lessonRepositoryProvider],
  controllers: [LessonController],
})
export class LessonModule {}

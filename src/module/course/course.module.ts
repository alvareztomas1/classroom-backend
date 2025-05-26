import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseMapper } from '@module/course/application/mapper/course.mapper';
import { COURSE_REPOSITORY_KEY } from '@module/course/application/repository/repository.interface';
import { CourseService } from '@module/course/application/service/course.service';
import { CoursePostgresRepository } from '@module/course/infrastructure/database/course.postrges.repository';
import { CourseSchema } from '@module/course/infrastructure/database/course.schema';
import { CourseController } from '@module/course/interface/course.controller';

const courseRepositoryProvider: Provider = {
  provide: COURSE_REPOSITORY_KEY,
  useClass: CoursePostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([CourseSchema])],
  providers: [CourseService, courseRepositoryProvider, CourseMapper],
  controllers: [CourseController],
})
export class CourseModule {}

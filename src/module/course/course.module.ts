import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseDtoMapper } from '@module/course/application/mapper/course-dto.mapper';
import { CourseMapper } from '@module/course/application/mapper/course.mapper';
import { CreateCoursePolicyHandler } from '@module/course/application/policy/create-course-policy-handler';
import { DeleteCoursePolicyHandler } from '@module/course/application/policy/delete-course-policy-handler';
import { UpdateCoursePolicyHandler } from '@module/course/application/policy/update-course-policy.handler';
import { COURSE_REPOSITORY_KEY } from '@module/course/application/repository/repository.interface';
import { CourseService } from '@module/course/application/service/course.service';
import { Course } from '@module/course/domain/course.entity';
import { coursePermissions } from '@module/course/domain/course.permissions';
import { CourseEntity } from '@module/course/infrastructure/database/course.entity';
import { CoursePostgresRepository } from '@module/course/infrastructure/database/course.postrges.repository';
import { CourseController } from '@module/course/interface/course.controller';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

const courseRepositoryProvider: Provider = {
  provide: COURSE_REPOSITORY_KEY,
  useClass: CoursePostgresRepository,
};

const policyHandlersProviders = [
  CreateCoursePolicyHandler,
  UpdateCoursePolicyHandler,
  DeleteCoursePolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity]),
    AuthorizationModule.forFeature(),
  ],
  providers: [
    CourseService,
    courseRepositoryProvider,
    CourseDtoMapper,
    CourseMapper,
    ...policyHandlersProviders,
  ],
  controllers: [CourseController],
  exports: [courseRepositoryProvider],
})
export class CourseModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Course, coursePermissions);
  }
}

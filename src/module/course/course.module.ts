import { Module, OnModuleInit, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { UserModule } from '@iam/user/user.module';

import { CourseDtoMapper } from '@course/application/mapper/course-dto.mapper';
import { CourseMapper } from '@course/application/mapper/course.mapper';
import { CreateCoursePolicyHandler } from '@course/application/policy/create-course-policy-handler';
import { DeleteCoursePolicyHandler } from '@course/application/policy/delete-course-policy-handler';
import { UpdateCoursePolicyHandler } from '@course/application/policy/update-course-policy.handler';
import { COURSE_REPOSITORY_KEY } from '@course/application/repository/repository.interface';
import { CourseService } from '@course/application/service/course.service';
import { Course } from '@course/domain/course.entity';
import { coursePermissions } from '@course/domain/course.permissions';
import { CourseEntity } from '@course/infrastructure/database/course.entity';
import { CoursePostgresRepository } from '@course/infrastructure/database/course.postrges.repository';
import { CourseController } from '@course/interface/course.controller';

import { CategoryModule } from '@category/category.module';
import { CategoryEntity } from '@category/infrastructure/database/category.entity';

import { SectionModule } from '@section/section.module';

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
    TypeOrmModule.forFeature([CourseEntity, CategoryEntity]),
    AuthorizationModule.forFeature(),
    CategoryModule,
    UserModule,
    forwardRef(() => SectionModule),
  ],
  providers: [
    CourseService,
    courseRepositoryProvider,
    CourseDtoMapper,
    CourseMapper,
    ...policyHandlersProviders,
  ],
  controllers: [CourseController],
  exports: [courseRepositoryProvider, CourseMapper],
})
export class CourseModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Course, coursePermissions);
  }
}

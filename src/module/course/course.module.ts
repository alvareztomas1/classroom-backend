import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseMapper } from '@module/course/application/mapper/course.mapper';
import { CreateCoursePolicyHandler } from '@module/course/application/policy/create-course-policy-handler';
import { DeleteCoursePolicyHandler } from '@module/course/application/policy/delete-course-policy-handler';
import { UpdateCoursePolicyHandler } from '@module/course/application/policy/update-course-policy.handler';
import { COURSE_REPOSITORY_KEY } from '@module/course/application/repository/repository.interface';
import { CourseService } from '@module/course/application/service/course.service';
import { coursePermissions } from '@module/course/domain/course.permissions';
import { CoursePostgresRepository } from '@module/course/infrastructure/database/course.postrges.repository';
import { CourseSchema } from '@module/course/infrastructure/database/course.schema';
import { CourseController } from '@module/course/interface/course.controller';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';

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
    TypeOrmModule.forFeature([CourseSchema]),
    AuthorizationModule.forFeature({ permissions: coursePermissions }),
  ],
  providers: [
    CourseService,
    courseRepositoryProvider,
    CourseMapper,
    ...policyHandlersProviders,
  ],
  controllers: [CourseController],
})
export class CourseModule {}

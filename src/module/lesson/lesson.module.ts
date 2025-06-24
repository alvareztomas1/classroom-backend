import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { LessonMapper } from '@module/lesson/application/mapper/lesson.mapper';
import { CreateLessonPolicyHandler } from '@module/lesson/application/policy/create-lesson-policy.handler';
import { LESSON_REPOSITORY_KEY } from '@module/lesson/application/repository/lesson.repository.interface';
import { LessonService } from '@module/lesson/application/service/lesson.service';
import { Lesson } from '@module/lesson/domain/lesson.entity';
import { lessonPermissions } from '@module/lesson/domain/lesson.permissions';
import { LessonPostgresRepository } from '@module/lesson/infrastructure/database/lesson.postgres.repository';
import { LessonSchema } from '@module/lesson/infrastructure/database/lesson.schema';
import { LessonController } from '@module/lesson/interface/lesson.controller';

const lessonRepositoryProvider: Provider = {
  provide: LESSON_REPOSITORY_KEY,
  useClass: LessonPostgresRepository,
};

const policyHandlersProvider = [CreateLessonPolicyHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonSchema]),
    AuthorizationModule.forFeature(),
    SectionModule,
  ],
  providers: [
    LessonService,
    LessonMapper,
    lessonRepositoryProvider,
    ...policyHandlersProvider,
  ],
  controllers: [LessonController],
})
export class LessonModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Lesson, lessonPermissions);
  }
}

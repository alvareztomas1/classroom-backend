import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

import { LessonDtoMapper } from '@module/lesson/application/mapper/lesson-dto.mapper';
import { LessonMapper } from '@module/lesson/application/mapper/lesson.mapper';
import { CreateLessonPolicyHandler } from '@module/lesson/application/policy/create-lesson-policy.handler';
import { DeleteLessonPolicyHandler } from '@module/lesson/application/policy/delete-lession-policy.handler';
import { UpdateLessonPolicyHandler } from '@module/lesson/application/policy/update-lesson-policy.handler';
import { LESSON_REPOSITORY_KEY } from '@module/lesson/application/repository/lesson.repository.interface';
import { LessonService } from '@module/lesson/application/service/lesson.service';
import { Lesson } from '@module/lesson/domain/lesson.entity';
import { lessonPermissions } from '@module/lesson/domain/lesson.permissions';
import { LessonEntity } from '@module/lesson/infrastructure/database/lesson.entity';
import { LessonPostgresRepository } from '@module/lesson/infrastructure/database/lesson.postgres.repository';
import { LessonController } from '@module/lesson/interface/lesson.controller';
import { SectionModule } from '@module/section/section.module';

const lessonRepositoryProvider: Provider = {
  provide: LESSON_REPOSITORY_KEY,
  useClass: LessonPostgresRepository,
};

const policyHandlersProvider = [
  CreateLessonPolicyHandler,
  UpdateLessonPolicyHandler,
  DeleteLessonPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonEntity]),
    AuthorizationModule.forFeature(),
    SectionModule,
  ],
  providers: [
    LessonService,
    LessonMapper,
    LessonDtoMapper,
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

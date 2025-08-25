import { Module, OnModuleInit, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

import { SectionModule } from '@section/section.module';

import { LessonDtoMapper } from '@lesson/application/mapper/lesson-dto.mapper';
import { LessonMapper } from '@lesson/application/mapper/lesson.mapper';
import { CreateLessonPolicyHandler } from '@lesson/application/policy/create-lesson-policy.handler';
import { DeleteLessonPolicyHandler } from '@lesson/application/policy/delete-lession-policy.handler';
import { UpdateLessonPolicyHandler } from '@lesson/application/policy/update-lesson-policy.handler';
import { LESSON_REPOSITORY_KEY } from '@lesson/application/repository/lesson.repository.interface';
import { LessonService } from '@lesson/application/service/lesson.service';
import { Lesson } from '@lesson/domain/lesson.entity';
import { lessonPermissions } from '@lesson/domain/lesson.permissions';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';
import { LessonPostgresRepository } from '@lesson/infrastructure/database/lesson.postgres.repository';
import { LessonController } from '@lesson/interface/lesson.controller';

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
    forwardRef(() => SectionModule),
  ],
  providers: [
    LessonService,
    LessonMapper,
    LessonDtoMapper,
    lessonRepositoryProvider,
    ...policyHandlersProvider,
  ],
  controllers: [LessonController],
  exports: [LessonMapper],
})
export class LessonModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Lesson, lessonPermissions);
  }
}

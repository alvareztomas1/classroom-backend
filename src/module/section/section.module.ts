import { Module, OnModuleInit, Provider, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { UserModule } from '@iam/user/user.module';

import { CourseModule } from '@course/course.module';

import { CategoryModule } from '@category/category.module';

import { SectionDtoMapper } from '@section/application/mapper/section-dto.mapper';
import { SectionMapper } from '@section/application/mapper/section.mapper';
import { CreateSectionPolicyHandler } from '@section/application/policy/create-section-policy.handler';
import { DeleteSectionPolicyHandler } from '@section/application/policy/delete-section-policy.handler';
import { UpdateSectionPolicyHandler } from '@section/application/policy/update-section-policy.handler';
import { SECTION_REPOSITORY_KEY } from '@section/application/repository/section.repository.interface';
import { SectionService } from '@section/application/service/section.service';
import { Section } from '@section/domain/section.entity';
import { sectionPermissions } from '@section/domain/section.permissions';
import { SectionEntity } from '@section/infrastructure/database/section.entity';
import { SectionPostgresRepository } from '@section/infrastructure/database/section.postgres.repository';
import { SectionController } from '@section/interface/section.controller';

import { LessonModule } from '@lesson/lesson.module';

export const sectionRepositoryProvider: Provider = {
  provide: SECTION_REPOSITORY_KEY,
  useClass: SectionPostgresRepository,
};

const policyHandlersProviders = [
  CreateSectionPolicyHandler,
  UpdateSectionPolicyHandler,
  DeleteSectionPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([SectionEntity]),
    AuthorizationModule.forFeature(),
    UserModule,
    CategoryModule,
    forwardRef(() => CourseModule),
    forwardRef(() => LessonModule),
  ],
  providers: [
    SectionService,
    sectionRepositoryProvider,
    SectionDtoMapper,
    SectionMapper,
    ...policyHandlersProviders,
  ],
  controllers: [SectionController],
  exports: [sectionRepositoryProvider, SectionMapper],
})
export class SectionModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Section, sectionPermissions);
  }
}

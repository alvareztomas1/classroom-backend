import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from '@course/course.module';

import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { SectionDtoMapper } from '@module/section/application/mapper/section-dto.mapper';
import { SectionMapper } from '@module/section/application/mapper/section.mapper';
import { CreateSectionPolicyHandler } from '@module/section/application/policy/create-section-policy.handler';
import { DeleteSectionPolicyHandler } from '@module/section/application/policy/delete-section-policy.handler';
import { UpdateSectionPolicyHandler } from '@module/section/application/policy/update-section-policy.handler';
import { SECTION_REPOSITORY_KEY } from '@module/section/application/repository/section.repository.interface';
import { SectionService } from '@module/section/application/service/section.service';
import { Section } from '@module/section/domain/section.entity';
import { sectionPermissions } from '@module/section/domain/section.permissions';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';
import { SectionPostgresRepository } from '@module/section/infrastructure/database/section.postgres.repository';
import { SectionController } from '@module/section/interface/section.controller';

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
    CourseModule,
  ],
  providers: [
    CourseModule,
    SectionService,
    sectionRepositoryProvider,
    SectionDtoMapper,
    SectionMapper,
    ...policyHandlersProviders,
  ],
  controllers: [SectionController],
  exports: [sectionRepositoryProvider],
})
export class SectionModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Section, sectionPermissions);
  }
}

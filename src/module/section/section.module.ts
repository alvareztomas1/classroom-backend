import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from '@module/course/course.module';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { SectionMapper } from '@module/section/application/mapper/section.mapper';
import { CreateSectionPolicyHandler } from '@module/section/application/policy/create-section-policy.handler';
import { DeleteSectionPolicyHandler } from '@module/section/application/policy/delete-section-policy.handler';
import { UpdateSectionPolicyHandler } from '@module/section/application/policy/update-section-policy.handler';
import { SECTION_REPOSITORY_KEY } from '@module/section/application/repository/section.repository.interface';
import { SectionService } from '@module/section/application/service/section.service';
import { Section } from '@module/section/domain/section.entity';
import { sectionPermissions } from '@module/section/domain/section.permissions';
import { SectionPostgresRepository } from '@module/section/infrastructure/database/section.postgres.repository';
import { SectionSchema } from '@module/section/infrastructure/database/section.schema';
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
    TypeOrmModule.forFeature([SectionSchema]),
    AuthorizationModule.forFeature(),
    CourseModule,
  ],
  providers: [
    CourseModule,
    SectionService,
    sectionRepositoryProvider,
    SectionMapper,
    ...policyHandlersProviders,
  ],
  controllers: [SectionController],
  exports: [SectionService, sectionRepositoryProvider],
})
export class SectionModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Section, sectionPermissions);
  }
}

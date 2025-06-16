import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { SectionMapper } from '@module/section/application/mapper/section.mapper';
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
@Module({
  imports: [TypeOrmModule.forFeature([SectionSchema])],
  providers: [SectionService, sectionRepositoryProvider, SectionMapper],
  controllers: [SectionController],
  exports: [SectionService, sectionRepositoryProvider],
})
export class SectionModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Section, sectionPermissions);
  }
}

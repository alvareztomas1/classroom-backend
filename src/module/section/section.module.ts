import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionMapper } from '@module/section/application/mapper/section.mapper';
import { SECTION_REPOSITORY_KEY } from '@module/section/application/repository/section.repository.interface';
import { SectionService } from '@module/section/application/service/section.service';
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
export class SectionModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { ISectionRepository } from '@module/section/application/repository/section.repository.interface';
import { Section } from '@module/section/domain/section.entity';
import { SectionSchema } from '@module/section/infrastructure/database/section.schema';

@Injectable()
export class SectionPostgresRepository
  extends BaseRepository<Section>
  implements ISectionRepository
{
  constructor(
    @InjectRepository(SectionSchema) repository: Repository<Section>,
  ) {
    super(repository);
  }
}

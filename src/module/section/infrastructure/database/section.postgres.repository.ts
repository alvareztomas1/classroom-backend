import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { SectionMapper } from '@section/application/mapper/section.mapper';
import { ISectionRepository } from '@section/application/repository/section.repository.interface';
import { Section } from '@section/domain/section.entity';
import { SectionEntity } from '@section/infrastructure/database/section.entity';

@Injectable()
export class SectionPostgresRepository
  extends BaseRepository<Section, SectionEntity>
  implements ISectionRepository
{
  constructor(
    @InjectRepository(SectionEntity) repository: Repository<SectionEntity>,
    private readonly sectionMapper: SectionMapper,
  ) {
    super(repository, sectionMapper);
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    const section = await this.repository.findOne({
      where: { id },
      relations: ['lessons'],
    });

    if (!section) {
      throw new EntityNotFoundException(id);
    }

    await this.repository.softRemove(section);
  }
}

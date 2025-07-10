import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

import { ISectionRepository } from '@module/section/application/repository/section.repository.interface';
import { Section } from '@module/section/domain/section.entity';
import { SectionEntity } from '@module/section/infrastructure/database/section.entity';

@Injectable()
export class SectionPostgresRepository
  extends BaseRepository<Section>
  implements ISectionRepository
{
  constructor(
    @InjectRepository(SectionEntity) repository: Repository<Section>,
  ) {
    super(repository);
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

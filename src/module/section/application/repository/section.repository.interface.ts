import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Section } from '@section/domain/section.entity';
import { SectionEntity } from '@section/infrastructure/database/section.entity';

export const SECTION_REPOSITORY_KEY = 'section_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISectionRepository
  extends BaseRepository<Section, SectionEntity> {}

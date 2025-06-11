import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Section } from '@module/section/domain/section.entity';

export const SECTION_REPOSITORY_KEY = 'section_repository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISectionRepository extends BaseRepository<Section> {}

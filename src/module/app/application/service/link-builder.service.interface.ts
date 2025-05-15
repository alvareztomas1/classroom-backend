import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { IDto } from '@common/base/application/dto/dto.interface';
import {
  ICollectionLinks,
  IResponseDtoLinks,
} from '@common/base/application/dto/serialized-response.interface';

export interface ILinkBuilderService {
  buildSingleEntityLinks(
    currentRequestUrl: string,
    entityName: string,
    dto: IDto,
    hasUpdate?: boolean,
    hasDelete?: boolean,
  ): IResponseDtoLinks;
  buildCollectionLinks(
    entityName: string,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks;
}

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  ILink,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { ILinkMetadata } from '@common/base/infrastructure/decorator/hypermedia.decorator';

export interface ILinkBuilderService {
  buildSingleEntityLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    baseAppUrl: string,
    linksMetadata: ILinkMetadata[],
    id: string,
  ): ILink[];
  buildCollectionLinks(
    entityName: string,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks;
}

import { ILinkMetadata } from '@common/base/application/decorator/hypermedia.decorator';
import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  ILink,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

export interface ILinkBuilderService {
  buildSingleEntityLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    baseAppUrl: string,
    linksMetadata: ILinkMetadata[],
    responseDto: BaseResponseDto,
    params: Record<string, string>,
  ): ILink[];
  buildPaginatedCollectionLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks;
  buildCollectionLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
  ): ICollectionLinks;
}

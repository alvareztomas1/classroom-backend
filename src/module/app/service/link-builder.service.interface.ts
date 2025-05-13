import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { IDto } from '@common/base/application/dto/dto.interface';
import {
  ICollectionLinks,
  IResponseDtoLinks,
} from '@common/base/application/dto/serialized-response.interface';

export interface ILinkBuilderService {
  buildSingleEntityLinks(entityName: string, dto: IDto): IResponseDtoLinks;
  buildCollectionLinks(
    entityName: string,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks;
}

export interface ISingleEntityLinkBuilder {
  buildSingleEntityLinks(
    baseUrl: string,
    entityName: string,
  ): IResponseDtoLinks;
}

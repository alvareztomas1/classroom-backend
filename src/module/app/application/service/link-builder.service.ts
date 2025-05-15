import { Injectable } from '@nestjs/common';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  ILink,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { ILinkMetadata } from '@common/base/infrastructure/decorator/hypermedia.decorator';

import { ILinkBuilderService } from '@module/app/application/service/link-builder.service.interface';

@Injectable()
export class LinkBuilderService implements ILinkBuilderService {
  constructor() {}

  buildSingleEntityLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    baseAppUrl: string,
    linksMetadata: ILinkMetadata[],
    id: string,
  ): ILink[] {
    const selfLink = this.buildSelfLink(
      currentRequestUrl,
      currentRequestMethod,
    );
    const links = linksMetadata.map((linkMetadata) => ({
      href: `${baseAppUrl}${linkMetadata.endpoint.replace(':id', id)}`,
      rel: linkMetadata.rel,
      method: linkMetadata.method,
    }));

    return [selfLink, ...links];
  }

  buildCollectionLinks(
    entityName: string,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks {
    return this.fromPagingDataToCollectionLinks(entityName, pagingData);
  }

  private fromPagingDataToCollectionLinks(
    entityName: string,
    {
      pageCount,
      pageNumber,
      pageSize,
    }: Omit<IPagingCollectionData, 'itemCount'>,
  ): ICollectionLinks {
    const links: ICollectionLinks = {
      self: {
        href: `/${entityName}?page[number]=${pageNumber}&page[size]=${pageSize}`,
        rel: 'self',
        method: HttpMethod.GET,
      },
      first: {
        href: `/${entityName}?page[number]=1&page[size]=${pageSize}`,
        rel: 'first',
        method: HttpMethod.GET,
      },
      last: {
        href: `/${entityName}?page[number]=${pageCount}&page[size]=${pageSize}`,
        rel: 'last',
        method: HttpMethod.GET,
      },
    };

    if (pageNumber > 1) {
      links.previous = {
        href: `/${entityName}?page[number]=${pageNumber - 1}&page[size]=${pageSize}`,
        rel: 'previous',
        method: HttpMethod.GET,
      };
    }

    if (pageNumber < pageCount) {
      links.next = {
        href: `/${entityName}?page[number]=${pageNumber + 1}&page[size]=${pageSize}`,
        rel: 'next',
        method: HttpMethod.GET,
      };
    }

    return links;
  }

  private buildSelfLink(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
  ): ILink {
    return {
      href: currentRequestUrl,
      rel: 'self',
      method: currentRequestMethod,
    };
  }
}

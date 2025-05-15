import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  IResponseDtoLinks,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { ILinkBuilderService } from '@module/app/application/service/link-builder.service.interface';

export class LinkBuilderService implements ILinkBuilderService {
  protected appBaseUrl: string;
  constructor(appBaseUrl: string) {
    this.appBaseUrl = appBaseUrl;
  }

  buildSingleEntityLinks(
    currentRequestUrl: string,
    entityName: string,
    id: string,
    hasUpdate?: boolean,
    hasDelete?: boolean,
  ): IResponseDtoLinks {
    return {
      self: {
        href: currentRequestUrl,
        rel: 'self',
        method: HttpMethod.GET,
      },
      ...(hasUpdate && {
        update: {
          href: `${this.appBaseUrl}/${entityName}/${id}`,
          rel: 'update',
          method: HttpMethod.PUT,
        },
      }),
      ...(hasDelete && {
        delete: {
          href: `${this.appBaseUrl}/${entityName}/${id}`,
          rel: 'delete',
          method: HttpMethod.DELETE,
        },
      }),
    };
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
        href: `${this.appBaseUrl}/${entityName}?page[number]=${pageNumber}&page[size]=${pageSize}`,
        rel: 'self',
        method: HttpMethod.GET,
      },
      first: {
        href: `${this.appBaseUrl}/${entityName}?page[number]=1&page[size]=${pageSize}`,
        rel: 'first',
        method: HttpMethod.GET,
      },
      last: {
        href: `${this.appBaseUrl}/${entityName}?page[number]=${pageCount}&page[size]=${pageSize}`,
        rel: 'last',
        method: HttpMethod.GET,
      },
    };

    if (pageNumber > 1) {
      links.previous = {
        href: `${this.appBaseUrl}/${entityName}?page[number]=${pageNumber - 1}&page[size]=${pageSize}`,
        rel: 'previous',
        method: HttpMethod.GET,
      };
    }

    if (pageNumber < pageCount) {
      links.next = {
        href: `${this.appBaseUrl}/${entityName}?page[number]=${pageNumber + 1}&page[size]=${pageSize}`,
        rel: 'next',
        method: HttpMethod.GET,
      };
    }

    return links;
  }
}

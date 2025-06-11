import { Injectable } from '@nestjs/common';

import { ILinkMetadata } from '@common/base/application/decorator/hypermedia.decorator';
import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  ILink,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { ILinkBuilderService } from '@module/app/application/service/link-builder.service.interface';

@Injectable()
export class LinkBuilderService implements ILinkBuilderService {
  constructor() {}

  private readonly pathParamRegex = /:([a-zA-Z0-9_]+)/g;

  buildSingleEntityLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    baseAppUrl: string,
    linksMetadata: ILinkMetadata[],
    responseDto: BaseResponseDto,
  ): ILink[] {
    const selfLink = this.buildSelfLink(
      currentRequestUrl,
      currentRequestMethod,
    );
    const relatedLinks = this.buildRelatedLinks(
      linksMetadata,
      baseAppUrl,
      responseDto,
    );

    return [selfLink, ...relatedLinks];
  }

  buildCollectionLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    pagingData: IPagingCollectionData,
  ): ICollectionLinks {
    const selfLink = this.buildSelfLink(
      currentRequestUrl,
      currentRequestMethod,
    );

    const pagingLinks = this.buildPagingLinks(currentRequestUrl, pagingData);
    return [selfLink, ...pagingLinks];
  }

  private buildPagingLinks(
    currentRequestUrl: string,
    pagingData: IPagingCollectionData,
  ): ILink[] {
    const links: ILink[] = [];
    const { pageSize, pageNumber, pageCount } = pagingData;

    links.push(this.buildPagingLink(currentRequestUrl, pageSize, 1, 'first'));

    links.push(
      this.buildPagingLink(currentRequestUrl, pageSize, pageCount, 'last'),
    );

    if (pageNumber > 1) {
      links.push(
        this.buildPagingLink(
          currentRequestUrl,
          pageSize,
          pageNumber - 1,
          'prev',
        ),
      );
    }

    if (pageNumber < pageCount) {
      links.push(
        this.buildPagingLink(
          currentRequestUrl,
          pageSize,
          pageNumber + 1,
          'next',
        ),
      );
    }

    return links;
  }

  private buildPagingLink(
    currentRequestUrl: string,
    pageSize: number,
    pageNumber: number,
    rel: string,
  ): ILink {
    const url = new URL(currentRequestUrl);
    const params = url.searchParams;

    params.set('page[number]', pageNumber.toString());
    params.set('page[size]', pageSize.toString());
    url.search = params.toString();

    url.search = decodeURIComponent(params.toString());

    return {
      href: url.toString(),
      rel,
      method: HttpMethod.GET,
    };
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

  private buildRelatedLinks(
    linksMetadata: ILinkMetadata[],
    baseAppUrl: string,
    dto: BaseResponseDto,
  ): ILink[] {
    return linksMetadata.map((link) => ({
      href: `${baseAppUrl}${this.replacePathParams(link.endpoint, dto)}`,
      rel: link.rel,
      method: link.method,
    }));
  }

  private replacePathParams(endpoint: string, dto: BaseResponseDto): string {
    return endpoint.replace(
      this.pathParamRegex,
      (_, param) => dto[param as keyof BaseResponseDto] ?? `:${param}`,
    );
  }
}

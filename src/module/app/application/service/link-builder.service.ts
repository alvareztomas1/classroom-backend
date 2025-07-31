import { Injectable } from '@nestjs/common';

import { ILinkMetadata } from '@common/base/application/decorator/hypermedia.decorator';
import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  ILink,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { ILinkBuilderService } from '@app/application/service/link-builder.service.interface';

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
    params: Record<string, string>,
    withSelfLink = true,
  ): ILink[] {
    const selfLink =
      withSelfLink &&
      this.buildSelfLink(currentRequestUrl, currentRequestMethod);
    const relatedLinks = this.buildRelatedLinks(
      linksMetadata,
      baseAppUrl,
      responseDto,
      params,
    );

    return selfLink ? [selfLink, ...relatedLinks] : relatedLinks;
  }

  buildPaginatedCollectionLinks(
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

  buildCollectionLinks(
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
  ): ICollectionLinks {
    const selfLinks = this.buildSelfLink(
      currentRequestUrl,
      currentRequestMethod,
    );

    return [selfLinks];
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
    params: Record<string, string>,
  ): ILink[] {
    return linksMetadata.map((link) => ({
      href: `${baseAppUrl}${this.replacePathParams(link.endpoint, dto, params)}`,
      rel: link.rel,
      method: link.method,
    }));
  }

  private replacePathParams(
    endpoint: string,
    dto: BaseResponseDto,
    params: Record<string, string>,
  ): string {
    return endpoint.replace(
      this.pathParamRegex,
      (_, param) =>
        dto[param as keyof BaseResponseDto] ??
        params?.[param as string] ??
        `:${param}`,
    );
  }
}

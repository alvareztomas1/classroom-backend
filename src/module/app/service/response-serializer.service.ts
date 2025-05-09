import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import {
  ICollectionLinks,
  IResponseDtoLinks,
} from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

@Injectable()
export class ResponseSerializerService {
  private appBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appBaseUrl = this.configService.get('server.baseUrl');
  }

  serializeResponseDto<ResponseDto extends object>(
    id: string,
    responseDto: ResponseDto,
    entityName: string,
  ): SerializedResponseDto<ResponseDto> {
    const links: IResponseDtoLinks = {
      self: {
        href: `${this.appBaseUrl}/${entityName}/${id}`,
        rel: 'self',
        method: HttpMethod.GET,
      },
      update: {
        href: `${this.appBaseUrl}/${entityName}/${id}`,
        rel: 'update',
        method: HttpMethod.PUT,
      },
      delete: {
        href: `${this.appBaseUrl}/${entityName}/${id}`,
        rel: 'delete',
        method: HttpMethod.DELETE,
      },
    };

    return new SerializedResponseDto(responseDto, links);
  }

  serializeResponseDtoCollection<ResponseDto extends object>(
    responseDtos: ResponseDto[],
    entityName: string,
    { itemCount, pageCount, pageNumber, pageSize }: IPagingCollectionData,
  ): SerializedResponseDtoCollection<ResponseDto> {
    const links = this.fromPagingDataToCollectionLinks(entityName, {
      pageCount,
      pageNumber,
      pageSize,
    });

    return new SerializedResponseDtoCollection(responseDtos, links, {
      itemCount,
      pageCount,
      pageNumber,
      pageSize,
    });
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

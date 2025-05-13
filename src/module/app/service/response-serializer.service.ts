import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { IResponseDtoLinks } from '@common/base/application/dto/serialized-response.interface';

import { LinkBuilderService } from '@module/app/service/link-builder.service';
import { ISingleEntityLinkBuilder } from '@module/app/service/link-builder.service.interface';

@Injectable()
export class ResponseSerializerService {
  private baseAppUrl: string;
  private linkBuilderService: LinkBuilderService;
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.baseAppUrl = this.configService.get('server.baseUrl');
    this.linkBuilderService = new LinkBuilderService(this.baseAppUrl);
  }

  serializeResponseDto<ResponseDto extends object>(
    id: string,
    responseDto: ResponseDto,
    entityName: string,
    customLinkBuilder?: ISingleEntityLinkBuilder,
  ): SerializedResponseDto<ResponseDto> {
    const links: IResponseDtoLinks = customLinkBuilder
      ? customLinkBuilder.buildSingleEntityLinks(this.baseAppUrl, entityName)
      : this.linkBuilderService.buildSingleEntityLinks(entityName, id);

    return new SerializedResponseDto(responseDto, links);
  }

  serializeResponseDtoCollection<ResponseDto extends object>(
    responseDtos: ResponseDto[],
    entityName: string,
    { itemCount, pageCount, pageNumber, pageSize }: IPagingCollectionData,
  ): SerializedResponseDtoCollection<ResponseDto> {
    const links = this.linkBuilderService.buildCollectionLinks(entityName, {
      itemCount,
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
}

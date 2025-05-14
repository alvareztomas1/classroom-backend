import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import {
  IResponseDtoLinks,
  ISerializeResponseDtoParams,
  ISerializedResponseData,
} from '@common/base/application/dto/serialized-response.interface';

import { AppService } from '@module/app/service/app.service';
import { LinkBuilderService } from '@module/app/service/link-builder.service';

@Injectable()
export class ResponseSerializerService {
  private baseAppUrl: string;
  private linkBuilderService: LinkBuilderService;
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
  ) {
    this.baseAppUrl = this.configService.get('server.baseUrl');
    this.linkBuilderService = new LinkBuilderService(this.baseAppUrl);
  }

  serializeResponseDto<ResponseDto extends object>({
    responseDto,
    entityName,
    id,
    hasUpdate,
    hasDelete,
  }: ISerializeResponseDtoParams<ResponseDto>): SerializedResponseDto<ResponseDto> {
    const links: IResponseDtoLinks =
      this.linkBuilderService.buildSingleEntityLinks(
        this.appService.getCurrentRequestUrl(),
        entityName,
        id,
        hasUpdate,
        hasDelete,
      );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...attributes } = responseDto as {
      id: string;
    } & ResponseDto;

    const serializedResponseData: ISerializedResponseData<ResponseDto> = {
      type: entityName,
      id,
      attributes: attributes as ResponseDto,
    };

    return new SerializedResponseDto(serializedResponseData, links);
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

    const serializedResponseData: ISerializedResponseData<ResponseDto>[] =
      responseDtos.map((responseDto) => {
        const { id, ...attributes } = responseDto as {
          id: string;
        } & ResponseDto;
        return {
          type: entityName,
          id,
          attributes: attributes as ResponseDto,
        };
      });

    return new SerializedResponseDtoCollection(serializedResponseData, links, {
      itemCount,
      pageCount,
      pageNumber,
      pageSize,
    });
  }
}

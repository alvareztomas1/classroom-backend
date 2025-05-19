/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, map } from 'rxjs';

import {
  HYPERMEDIA_KEY,
  ILinkMetadata,
} from '@common/base/application/decorator/hypermedia.decorator';
import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { IResponseDto } from '@common/base/application/dto/dto.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { ISerializedResponseData } from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { LinkBuilderService } from '@module/app/application/service/link-builder.service';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly linkBuilderService: LinkBuilderService,
    private readonly configService: ConfigService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const currentRequestUrl = this.getCurrentRequestUrl(request);
    const currentRequestMethod = request.method;
    const linksMetadata = this.reflector.get<ILinkMetadata[]>(
      HYPERMEDIA_KEY,
      context.getHandler(),
    );
    const baseAppUrl = this.configService.get<string>('server.baseUrl');

    return next.handle().pipe(
      map((responseData: BaseResponseDto | CollectionDto<IResponseDto>) => {
        if (responseData instanceof CollectionDto) {
          return this.buildSerializedCollection(
            responseData,
            currentRequestUrl,
            currentRequestMethod as HttpMethod,
          );
        }

        return this.buildSerializedResponseDto(
          responseData,
          currentRequestUrl,
          currentRequestMethod as HttpMethod,
          baseAppUrl,
          linksMetadata ?? [],
        );
      }),
    );
  }

  private buildSerializedCollection(
    collection: CollectionDto<IResponseDto>,
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
  ): SerializedResponseDtoCollection<Omit<BaseResponseDto, 'type'>> {
    const serializedCollectionData: ISerializedResponseData<
      Omit<BaseResponseDto, 'type'>
    >[] = collection.data.map((responseDto) =>
      this.buildSerializedResponseData(responseDto),
    );
    const meta: IPagingCollectionData = {
      itemCount: collection.itemCount,
      pageCount: collection.pageCount,
      pageNumber: collection.pageNumber,
      pageSize: collection.pageSize,
    };
    const links = this.linkBuilderService.buildCollectionLinks(
      currentRequestUrl,
      currentRequestMethod,
      meta,
    );

    return new SerializedResponseDtoCollection(
      serializedCollectionData,
      links,
      meta,
    );
  }

  private buildSerializedResponseDto(
    responseDto: BaseResponseDto,
    currentRequestUrl: string,
    currentRequestMethod: HttpMethod,
    baseAppUrl: string,
    linksMetadata: ILinkMetadata[],
  ): SerializedResponseDto<Omit<BaseResponseDto, 'type'>> {
    const links = this.linkBuilderService.buildSingleEntityLinks(
      currentRequestUrl,
      currentRequestMethod,
      baseAppUrl,
      linksMetadata,
      responseDto.id,
    );
    const serializedResponseData =
      this.buildSerializedResponseData(responseDto);

    return new SerializedResponseDto(serializedResponseData, links);
  }

  private buildSerializedResponseData(
    responseDto: BaseResponseDto,
  ): ISerializedResponseData<Omit<BaseResponseDto, 'type'>> {
    const { id, type, ...attributes } = responseDto;
    const serializedResponseData: ISerializedResponseData<
      Omit<BaseResponseDto, 'type'>
    > = {
      type,
      id,
      attributes,
    };

    return serializedResponseData;
  }

  private getCurrentRequestUrl(request: Request): string {
    const host = request.headers.host;
    const endpointUrl = `${request.protocol}://${host}${request.url}`;
    return endpointUrl;
  }
}

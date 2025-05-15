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

import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IResponseDto } from '@common/base/application/dto/dto.interface';
import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { ISerializedResponseData } from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import {
  HYPERMEDIA_KEY,
  ILinkMetadata,
} from '@common/base/infrastructure/decorator/hypermedia.decorator';

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
        if (!Array.isArray(responseData)) {
          return this.buildSerializedResponseDto(
            responseData as BaseResponseDto,
            currentRequestUrl,
            currentRequestMethod as HttpMethod,
            baseAppUrl,
            linksMetadata,
          );
        }
      }),
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
    const { id, type, ...attributes } = responseDto;
    const serializedResponseData: ISerializedResponseData<
      Omit<BaseResponseDto, 'type'>
    > = {
      type,
      id,
      attributes,
    };

    return new SerializedResponseDto(serializedResponseData, links);
  }

  private getCurrentRequestUrl(request: Request): string {
    const host = request.headers.host;
    const endpointUrl = `${request.protocol}://${host}${request.url}`;
    return endpointUrl;
  }
}

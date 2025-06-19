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
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { AppSubjects } from '@module/iam/authorization/infrastructure/casl/type/app-subjects.type';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly linkBuilderService: LinkBuilderService,
    private readonly configService: ConfigService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  intercept(
    context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: CallHandler<any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const currentRequestUrl = this.getCurrentRequestUrl(request);
    const currentRequestMethod = request.method;
    const linksMetadata =
      this.reflector.get<ILinkMetadata[]>(
        HYPERMEDIA_KEY,
        context.getHandler(),
      ) ?? [];
    const baseAppUrl = this.configService.get<string>('server.baseUrl');
    const user = request.user as User;
    const links = this.filterLinksByAuthorization(linksMetadata, user);
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
          baseAppUrl as string,
          links,
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
      responseDto,
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

  private filterLinksByAuthorization(
    links: ILinkMetadata[],
    user: User,
  ): ILinkMetadata[] {
    return links.filter((link) =>
      link.action && link.subject
        ? this.isAuthorized(user, link.action, link.subject)
        : true,
    );
  }

  private isAuthorized(
    user: User,
    action: AppAction,
    subject: AppSubjects,
  ): boolean {
    return this.authorizationService.isAllowed(user, action, subject);
  }
}

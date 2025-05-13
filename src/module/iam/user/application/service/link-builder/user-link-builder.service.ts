import { Injectable } from '@nestjs/common';

import { IResponseDtoLinks } from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { ISingleEntityLinkBuilder } from '@module/app/service/link-builder.service.interface';

@Injectable()
export class UserLinkBuilderService implements ISingleEntityLinkBuilder {
  buildSingleEntityLinks(
    baseUrl: string,
    entityName: string,
  ): IResponseDtoLinks {
    return {
      self: {
        href: `${baseUrl}/${entityName}/me`,
        rel: 'self',
        method: HttpMethod.GET,
      },
      update: {
        href: `${baseUrl}/${entityName}/me`,
        rel: 'update',
        method: HttpMethod.PUT,
      },
    };
  }
}

import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ILink } from '@common/base/application/dto/serialized-response.interface';

export interface ILinkMetadata extends Omit<ILink, 'href'> {
  endpoint: string;
}

export const HYPERMEDIA_KEY = 'HYPERMEDIA_KEY';

export const Hypermedia = (options: ILinkMetadata[]): CustomDecorator<string> =>
  SetMetadata(HYPERMEDIA_KEY, options);

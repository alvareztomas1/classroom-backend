import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { ILink } from '@common/base/application/dto/serialized-response.interface';

import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { AppSubjects } from '@iam/authorization/infrastructure/casl/type/app-subjects.type';

export interface ILinkMetadata extends Omit<ILink, 'href'> {
  endpoint: string;
  action?: AppAction;
  subject?: AppSubjects;
}

export const HYPERMEDIA_KEY = 'HYPERMEDIA_KEY';

export const Hypermedia = (options: ILinkMetadata[]): CustomDecorator<string> =>
  SetMetadata(HYPERMEDIA_KEY, options);

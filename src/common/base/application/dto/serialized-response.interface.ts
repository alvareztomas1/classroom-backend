import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

export interface ILink {
  href: string;
  method: HttpMethod;
  rel?: string;
}

export interface IResponseDtoLinks {
  self: ILink;
  update?: ILink;
  delete?: ILink;
}

export interface ICollectionLinks {
  self: ILink;
  first?: ILink;
  previous?: ILink;
  next?: ILink;
  last?: ILink;
}

export interface ISerializedCollection<Entity extends object> {
  data: Entity[];
  links: ICollectionLinks;
  meta: IPagingCollectionData;
}

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { IDto } from '@common/base/application/dto/dto.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

export interface ILink {
  href: string;
  method: HttpMethod;
  rel: string;
}

export type IResponseDtoLinks = ILink[];

export type ICollectionLinks = ILink[];

export interface ISerializedCollection<Entity extends object> {
  data: Entity[];
  links: ICollectionLinks;
  meta: IPagingCollectionData;
}

export type INonPaginatedSerializedCollection<Entity extends object> = Omit<
  ISerializedCollection<Entity>,
  'meta'
>;

export interface ISerializedResponseData<ResponseDto extends IDto> {
  type: string;
  id?: string;
  attributes: ResponseDto;
  links?: IResponseDtoLinks;
}
export interface ISerializeResponseDtoParams<ResponseDto extends IDto> {
  responseDto: ResponseDto;
  entityName: string;
  id?: string;
  hasUpdate?: boolean;
  hasDelete?: boolean;
}

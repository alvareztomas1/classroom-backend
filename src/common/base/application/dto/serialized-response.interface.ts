import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

export interface ILink {
  href: string;
  method: HttpMethod;
  rel: string;
}

export type IResponseDtoLinks = ILink[];

export type ICollectionLinks = ILink[];

export interface ISerializedCollection<Entity extends BaseResponseDto> {
  data: Entity[];
  links: ICollectionLinks;
  meta: IPagingCollectionData;
}

export type INonPaginatedSerializedCollection<Entity extends BaseResponseDto> =
  Omit<ISerializedCollection<Entity>, 'meta'>;

export interface ISerializedResponseData<ResponseDto extends BaseResponseDto> {
  type: string;
  id?: string;
  attributes: ResponseDto;
  links?: IResponseDtoLinks;
}

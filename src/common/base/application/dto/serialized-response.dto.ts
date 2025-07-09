import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  IResponseDtoLinks,
  ISerializedResponseData,
} from '@common/base/application/dto/serialized-response.interface';

export class SerializedResponseDtoCollection<ResponseDto extends object> {
  data: ISerializedResponseData<ResponseDto>[];
  links: ICollectionLinks;
  meta?: IPagingCollectionData;

  constructor(
    data: ISerializedResponseData<ResponseDto>[],
    links: ICollectionLinks,
    meta?: IPagingCollectionData,
  ) {
    this.data = data;
    this.links = links;
    if (meta) this.meta = meta;
  }
}

export class SerializedResponseDto<ResponseDto extends object> {
  data: Omit<ISerializedResponseData<ResponseDto>, 'links'>;
  links: IResponseDtoLinks;

  constructor(
    data: ISerializedResponseData<ResponseDto>,
    links: IResponseDtoLinks,
  ) {
    this.data = data;
    this.links = links;
  }
}

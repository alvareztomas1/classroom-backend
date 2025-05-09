import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  ICollectionLinks,
  IResponseDtoLinks,
} from '@common/base/application/dto/serialized-response.interface';

export class SerializedResponseDtoCollection<ResponseDto extends object> {
  data: ResponseDto[];
  links: ICollectionLinks;
  meta: IPagingCollectionData;

  constructor(
    data: ResponseDto[],
    links: ICollectionLinks,
    meta: IPagingCollectionData,
  ) {
    this.data = data;
    this.links = links;
    this.meta = meta;
  }
}

export class SerializedResponseDto<ResponseDto extends object> {
  data: ResponseDto;
  links: IResponseDtoLinks;

  constructor(data: ResponseDto, links: IResponseDtoLinks) {
    this.data = data;
    this.links = links;
  }
}

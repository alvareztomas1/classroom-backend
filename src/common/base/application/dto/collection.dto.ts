import {
  ICollection,
  IPagingCollectionData,
} from '@common/base/application/dto/collection.interface';
import { IResponseDto } from '@common/base/application/dto/dto.interface';

export class CollectionDto<Data extends IResponseDto>
  implements ICollection<Data>
{
  data: Data[];
  meta?: IPagingCollectionData;

  constructor({ data, meta }: ICollection<Data>) {
    this.data = data;
    this.meta = meta;
  }
}

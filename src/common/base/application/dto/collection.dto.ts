import {
  ICollection,
  IPagingCollectionData,
} from '@common/base/application/dto/collection.interface';
import { Base } from '@common/base/domain/base.entity';

export class CollectionDto<Data extends Base> implements ICollection<Data> {
  data: Data[];
  meta?: IPagingCollectionData;

  constructor({ data, meta }: ICollection<Data>) {
    this.data = data;
    this.meta = meta;
  }
}

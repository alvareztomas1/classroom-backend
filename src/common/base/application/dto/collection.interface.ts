import { Base } from '@common/base/domain/base.entity';

export interface IPagingCollectionData {
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}

export interface ICollection<ResponseDto extends Base> {
  data: ResponseDto[];
  meta?: IPagingCollectionData;
}

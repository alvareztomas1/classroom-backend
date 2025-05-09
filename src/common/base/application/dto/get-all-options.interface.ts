import { Base } from '@common/base/application/domain/base.entity';
import IEntity from '@common/base/application/domain/entity.interface';
import { IDto } from '@common/base/application/dto/dto.interface';
import { SortType } from '@common/base/application/enum/sort-type.enum';

export type SimpleProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Base | Base[] | Function ? never : K;
}[keyof T];

export type Filter<T> = Partial<Pick<T, SimpleProps<T>>>;
export type Sort<T> = Partial<Record<SimpleProps<T>, SortType>>;
export type Fields<T> = SimpleProps<T>[];

export type Page = {
  number?: number;
  size?: number;
  offset?: number;
};

export interface IGetAllOptions<T extends IDto | IEntity, Include = []> {
  page?: Page;
  filter?: Filter<T>;
  sort?: Sort<T>;
  fields?: Fields<T>;
  include?: Include;
}

import { IDto } from '@common/base/application/dto/dto.interface';
import { SortType } from '@common/base/application/enum/sort-type.enum';
import { Base } from '@common/base/domain/base.entity';
import IEntity from '@common/base/domain/entity.interface';

export type SimpleProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Base | Base[] | Function ? never : K;
}[keyof T];

type ComplexProps<T> = {
  [K in keyof T]: T[K] extends object | object[] ? K : never;
}[keyof T];

export type Filter<T> = Partial<Pick<T, SimpleProps<T>>>;
export type Sort<T> = Partial<Record<SimpleProps<T>, SortType>>;
export type Fields<T> = SimpleProps<T>[];
export type Relations<T> = ComplexProps<T>[];

export type Page = {
  number?: number;
  size?: number;
  offset?: number;
};

export interface IGetAllOptions<T extends IDto | IEntity> {
  page?: Page;
  filter?: Filter<T>;
  sort?: Sort<T>;
  fields?: Fields<T>;
  include?: Relations<T>;
}

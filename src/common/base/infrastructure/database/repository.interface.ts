import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import IEntity from '@common/base/domain/entity.interface';

export interface IRepository<T extends IEntity> {
  getAll(options: IGetAllOptions<T>): Promise<ICollection<T>>;
  saveOne(entity: T): Promise<T>;
  getOneById(id: string): Promise<T>;
  getOneByIdOrFail(id: string): Promise<T>;
  deleteOneByIdOrFail(id: string): Promise<void>;
  updateOneByIdOrFail(id: string, updates: Partial<Omit<T, 'id'>>): Promise<T>;
}

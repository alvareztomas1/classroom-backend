import Entity from '@common/base/application/domain/entity.interface';
import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';

export interface IRepository<T extends Entity> {
  getAll(options: IGetAllOptions<T>): Promise<ICollection<T>>;
  saveOne(entity: T): Promise<T>;
  getOneById(id: string): Promise<T>;
  getOneByIdOrFail(id: string): Promise<T>;
  deleteOneByIdOrFail(id: string): Promise<void>;
  updateOneByIdOrFail(id: string, updates: Partial<Omit<T, 'id'>>): Promise<T>;
}

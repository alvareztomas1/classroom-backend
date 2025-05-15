import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import IEntity from '@common/base/domain/entity.interface';
import { IRepository } from '@common/base/infrastructure/database/repository.interface';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

abstract class BaseRepository<T extends IEntity> implements IRepository<T> {
  protected readonly repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async getAll(options: IGetAllOptions<T>): Promise<ICollection<T>> {
    const { filter, page, sort, fields } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter as FindOptionsWhere<T>,
      order: sort as FindOptionsOrder<T>,
      select: fields,
      take: page.size,
      skip: page.offset,
    } as FindManyOptions<T>);

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneById(id: string): Promise<T> {
    return this.repository.findOne({
      where: { id },
    } as FindOneOptions<T>);
  }

  async getOneByIdOrFail(id: string): Promise<T> {
    const entity = await this.getOneById(id);

    if (!entity) {
      throw new EntityNotFoundException(id);
    }

    return entity;
  }

  async saveOne(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    const entityToDelete = await this.repository.findOne({
      where: { id },
    } as FindOneOptions<T>);

    if (!entityToDelete) {
      throw new EntityNotFoundException(id);
    }

    await this.repository.softDelete({ id } as FindOptionsWhere<T>);
  }

  async updateOneByIdOrFail(
    id: string,
    updates: Partial<Omit<T, 'id'>>,
  ): Promise<T> {
    const entityToUpdate = await this.repository.preload({
      ...updates,
      id,
    } as DeepPartial<T>);

    if (!entityToUpdate) {
      throw new EntityNotFoundException(id);
    }

    return this.repository.save(entityToUpdate);
  }
}

export default BaseRepository;

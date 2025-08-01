import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/base/application/constant/base.constants';
import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';
import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';
import { Base } from '@common/base/domain/base.entity';
import { BaseEntity } from '@common/base/infrastructure/database/base.entity';
import { IRepository } from '@common/base/infrastructure/database/repository.interface';
import EntityNotFoundException from '@common/base/infrastructure/exception/not.found.exception';

abstract class BaseRepository<
  DomainEntity extends Base,
  PersistenceEntity extends BaseEntity,
> implements IRepository<DomainEntity>
{
  protected readonly repository: Repository<PersistenceEntity>;
  protected readonly entityMapper: IEntityMapper<
    DomainEntity,
    PersistenceEntity
  >;
  protected readonly entityType: string;

  constructor(
    repository: Repository<PersistenceEntity>,
    entityMapper: IEntityMapper<DomainEntity, PersistenceEntity>,
    entityType: string,
  ) {
    this.repository = repository;
    this.entityMapper = entityMapper;
    this.entityType = entityType;
  }

  async getAll(
    options: IGetAllOptions<DomainEntity>,
  ): Promise<ICollection<DomainEntity>> {
    const { filter, page, sort, fields, include } = options || {};
    const [items, itemCount] = await this.repository.findAndCount({
      where: filter as FindOptionsWhere<DomainEntity>,
      order: sort as FindOptionsOrder<DomainEntity>,
      select: fields,
      take: page?.size,
      skip: page?.offset,
      relations: include,
    } as FindManyOptions<PersistenceEntity>);

    return {
      data: items.map((item) => this.entityMapper.toDomainEntity(item)),
      meta: {
        pageNumber: page?.number || DEFAULT_PAGE_NUMBER,
        pageSize: page?.size || DEFAULT_PAGE_NUMBER,
        pageCount: Math.ceil(itemCount / (page?.size || DEFAULT_PAGE_SIZE)),
        itemCount,
      },
    };
  }

  async getOneById(
    id: string,
    include?: (keyof DomainEntity)[],
  ): Promise<DomainEntity | null> {
    const persistenceEntity = await this.repository.findOne({
      where: { id },
      relations: include,
    } as FindOneOptions<PersistenceEntity>);

    return persistenceEntity
      ? this.entityMapper.toDomainEntity(persistenceEntity)
      : null;
  }

  async getOneByIdOrFail(
    id: string,
    include?: (keyof DomainEntity)[],
  ): Promise<DomainEntity> {
    const entity = await this.getOneById(id, include);

    if (!entity) {
      throw new EntityNotFoundException('id', id, this.entityType);
    }

    return entity;
  }

  async saveOne(entity: DomainEntity): Promise<DomainEntity> {
    const persistenceEntity = await this.repository.save(
      this.entityMapper.toPersistenceEntity(entity),
    );
    return this.entityMapper.toDomainEntity(persistenceEntity);
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    const entityToDelete = await this.repository.findOne({
      where: { id },
    } as FindOneOptions<PersistenceEntity>);

    if (!entityToDelete) {
      throw new EntityNotFoundException('id', id, this.entityType);
    }

    await this.repository.softDelete({
      id,
    } as FindOptionsWhere<PersistenceEntity>);
  }
}

export default BaseRepository;

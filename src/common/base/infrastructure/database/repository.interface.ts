import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';
import { Base } from '@common/base/domain/base.entity';

export interface IRepository<DomainEntity extends Base> {
  getAll(
    options: IGetAllOptions<DomainEntity>,
  ): Promise<ICollection<DomainEntity>>;
  saveOne(entity: DomainEntity): Promise<DomainEntity>;
  getOneById(id: string): Promise<DomainEntity | null>;
  getOneByIdOrFail(id: string): Promise<DomainEntity>;
  deleteOneByIdOrFail(id: string): Promise<void>;
}

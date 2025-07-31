import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';

import { User } from '@iam/user/domain/user.entity';

export const USER_REPOSITORY_KEY = 'user_repository';

export interface IUserRepository {
  getAll(options: IGetAllOptions<User>): Promise<ICollection<User>>;

  getOneByEmail(email: string): Promise<User | null>;

  getOneByExternalId(externalId: string): Promise<User | null>;

  getOneByEmailOrFail(email: string): Promise<User>;

  saveOne(user: User): Promise<User>;

  updateOneOrFail(
    id: string,
    updates: Partial<Omit<User, 'id'>>,
  ): Promise<User>;
}

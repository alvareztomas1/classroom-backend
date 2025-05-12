import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';

import { User } from '@module/iam/user/domain/user.entity';

export const USER_REPOSITORY_KEY = 'user_repository';

export interface IUserRepository {
  getAll(options: IGetAllOptions<User>): Promise<ICollection<User>>;

  getOneByEmail(email: string): Promise<User>;

  getOneByExternalId(externalId: string): Promise<User>;

  getOneByEmailOrFail(email: string): Promise<User>;

  saveOne(user: User): Promise<User>;

  updateOneOrFail(
    id: string,
    updates: Partial<Omit<User, 'id'>>,
  ): Promise<User>;
}

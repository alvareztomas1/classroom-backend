import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';

import { IUserRepository } from '@module/iam/user/application/repository/user.repository.interface';
import { User } from '@module/iam/user/domain/user.entity';
import { EmailNotFoundException } from '@module/iam/user/infrastructure/database/exception/email-not-found.exception';
import { UserNotFoundException } from '@module/iam/user/infrastructure/database/exception/user-not-found.exception';
import { UserSchema } from '@module/iam/user/infrastructure/database/user.schema';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<User>,
  ) {}

  async getAll(options: IGetAllOptions<User>): Promise<ICollection<User>> {
    const { filter, page, sort, fields } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter,
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByEmail(email: string): Promise<User> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async getOneByExternalId(externalId: string): Promise<User> {
    return this.repository.findOne({
      where: { externalId },
    });
  }

  async getOneByEmailOrFail(email: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { email },
    });

    if (!user) {
      throw new EmailNotFoundException({
        message: `User with email ${email} was not found`,
      });
    }

    return user;
  }

  async saveOne(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async updateOneOrFail(
    id: string,
    updates: Partial<Omit<User, 'id'>>,
  ): Promise<User> {
    const userToUpdate = await this.repository.preload({
      id,
      ...updates,
    });

    if (!userToUpdate) {
      throw new UserNotFoundException({
        message: `User with ID ${id} was not found`,
      });
    }

    return this.repository.save(userToUpdate);
  }
}

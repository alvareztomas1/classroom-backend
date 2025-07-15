import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/base/application/constant/base.constants';
import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import { IUserRepository } from '@module/iam/user/application/repository/user.repository.interface';
import { User } from '@module/iam/user/domain/user.entity';
import { EmailNotFoundException } from '@module/iam/user/infrastructure/database/exception/email-not-found.exception';
import { UserNotFoundException } from '@module/iam/user/infrastructure/database/exception/user-not-found.exception';
import { UserEntity } from '@module/iam/user/infrastructure/database/user.entity';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly userMapper: UserMapper,
  ) {}

  async getAll(options: IGetAllOptions<User>): Promise<ICollection<User>> {
    const { filter, page: page, sort, fields } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: {
        ...filter,
        roles: filter?.roles as unknown as AppRole,
      } as FindOptionsWhere<UserEntity>,
      order: sort,
      select: fields as (keyof User)[],
      take: page?.size,
      skip: page?.offset,
    });

    return {
      data: items.map((item) => this.userMapper.toDomainEntity(item)),
      meta: {
        pageNumber: page?.number || DEFAULT_PAGE_NUMBER,
        pageSize: page?.size || DEFAULT_PAGE_SIZE,
        pageCount: Math.ceil(itemCount / (page?.size || DEFAULT_PAGE_SIZE)),
        itemCount,
      },
    };
  }

  async getOneByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { email },
    });

    return user ? this.userMapper.toDomainEntity(user) : null;
  }

  async getOneByExternalId(externalId: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { externalId },
    });

    return user ? this.userMapper.toDomainEntity(user) : null;
  }

  async getOneByEmailOrFail(email: string): Promise<User> {
    const user = await this.getOneByEmail(email);

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

    return this.userMapper.toDomainEntity(
      await this.repository.save(userToUpdate),
    );
  }
}

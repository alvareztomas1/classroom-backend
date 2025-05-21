import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';

import { UpdateUserDto } from '@module/iam/user/application/dto/update-user.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserDto } from '@module/iam/user/application/dto/user.dto';
import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@module/iam/user/application/repository/user.repository.interface';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_KEY)
    private readonly repository: IUserRepository,
    private readonly mapper: UserMapper,
  ) {}

  async getAll(
    options: IGetAllOptions<UserDto>,
  ): Promise<CollectionDto<UserResponseDto>> {
    const collection = await this.repository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((user) =>
        this.mapper.fromEntityToResponseDto(user),
      ),
    });

    return collectionDto;
  }

  getMe(user: User): UserResponseDto {
    return this.mapper.fromEntityToResponseDto(user);
  }

  async updateMe(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const userToUpdate = this.mapper.fromUpdateDtoToEntity(updateUserDto, user);
    const updatedUser = await this.repository.updateOneOrFail(
      user.id,
      userToUpdate,
    );

    return this.mapper.fromEntityToResponseDto(updatedUser);
  }
}

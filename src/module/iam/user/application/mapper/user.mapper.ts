import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { UpdateUserDto } from '@module/iam/user/application/dto/update-user.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserDto } from '@module/iam/user/application/dto/user.dto';
import { User } from '@module/iam/user/domain/user.entity';

export class UserMapper
  implements
    Omit<
      IDtoMapper<User, UserDto, UpdateUserDto, UserResponseDto>,
      'fromCreateDtoToEntity' | 'fromUpdateDtoToEntity'
    >
{
  fromEntityToResponseDto(entity: User): UserResponseDto {
    return new UserResponseDto(
      User.getEntityName(),
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.roles,
      entity.avatarUrl,
      entity.externalId,
      entity.id,
      entity.isVerified,
    );
  }

  fromUpdateDtoToEntity(dto: UpdateUserDto, currentUser: User): User {
    return new User(
      currentUser.email,
      dto.firstName ?? currentUser.firstName,
      dto.lastName ?? currentUser.lastName,
      currentUser.roles,
      dto.avatarUrl ?? currentUser.avatarUrl,
      currentUser.id,
      currentUser.externalId,
      currentUser.createdAt,
      currentUser.updatedAt,
      currentUser.deletedAt,
      currentUser.isVerified,
    );
  }
}

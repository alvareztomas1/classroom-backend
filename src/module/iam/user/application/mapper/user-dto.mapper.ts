import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { UpdateUserDto } from '@iam/user/application/dto/update-user.dto';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserDto } from '@iam/user/application/dto/user.dto';
import { User } from '@iam/user/domain/user.entity';

export class UserDtoMapper
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
      currentUser.isVerified,
      currentUser.createdAt,
      currentUser.updatedAt,
      currentUser.deletedAt,
    );
  }
}

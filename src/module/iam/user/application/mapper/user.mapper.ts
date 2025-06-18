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
      entity.id,
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.roles,
      entity.isVerified,
      entity.avatarUrl,
      entity.externalId,
    );
  }

  fromUpdateDtoToEntity(dto: UpdateUserDto, currentUser: User): User {
    return new User(
      currentUser.email,
      dto.firstName,
      dto.lastName,
      currentUser.roles,
      dto.avatarUrl,
      currentUser.id,
      currentUser.externalId,
      currentUser.createdAt,
      currentUser.updatedAt,
      currentUser.deletedAt,
      currentUser.isVerified,
    );
  }
}

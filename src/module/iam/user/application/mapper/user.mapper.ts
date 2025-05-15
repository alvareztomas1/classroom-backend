import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { CreateUserDto } from '@module/iam/user/application/dto/create-user.dto';
import { UpdateUserDto } from '@module/iam/user/application/dto/update-user.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { User } from '@module/iam/user/domain/user.entity';

export class UserMapper
  implements IDtoMapper<User, CreateUserDto, UpdateUserDto, UserResponseDto>
{
  fromCreateDtoToEntity(dto: CreateUserDto): User {
    return new User(
      dto.email,
      dto.firstName,
      dto.lastName,
      AppRole.Regular,
      dto.avatarUrl,
    );
  }

  fromUpdateDtoToEntity(dto: UpdateUserDto): User {
    return new User(
      dto.email,
      dto.firstName,
      dto.lastName,
      AppRole.Regular,
      dto.avatarUrl,
    );
  }

  fromEntityToResponseDto(entity: User): UserResponseDto {
    return new UserResponseDto(
      User.getEntityName(),
      entity.id,
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.role,
      entity.isVerified,
      entity.avatarUrl,
      entity.externalId,
    );
  }
}

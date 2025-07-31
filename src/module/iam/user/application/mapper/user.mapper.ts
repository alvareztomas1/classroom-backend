import { IEntityMapper } from '@common/base/application/mapper/entity.mapper';

import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { User } from '@iam/user/domain/user.entity';
import { UserEntity } from '@iam/user/infrastructure/database/user.entity';

export class UserMapper implements IEntityMapper<User, UserEntity> {
  toDomainEntity(entity: UserEntity): User {
    return new User(
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.roles as AppRole[],
      entity.avatarUrl,
      entity.id,
      entity.externalId,
      entity.isVerified,
    );
  }

  toPersistenceEntity(domain: User): UserEntity {
    return new UserEntity(
      domain.email,
      domain.firstName,
      domain.lastName,
      domain.roles,
      domain.id,
      domain.externalId,
      domain.avatarUrl,
      domain.isVerified,
    );
  }
}

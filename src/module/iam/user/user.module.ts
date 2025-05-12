import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import { USER_REPOSITORY_KEY } from '@module/iam/user/application/repository/user.repository.interface';
import { UserPostgresRepository } from '@module/iam/user/infrastructure/database/user.postgres.repository';
import { UserSchema } from '@module/iam/user/infrastructure/database/user.schema';

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [userRepositoryProvider, UserMapper],
  exports: [userRepositoryProvider, UserMapper],
})
export class UserModule {}

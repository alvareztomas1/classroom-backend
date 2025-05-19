import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import { USER_REPOSITORY_KEY } from '@module/iam/user/application/repository/user.repository.interface';
import { UserService } from '@module/iam/user/application/service/user.service';
import { UserPostgresRepository } from '@module/iam/user/infrastructure/database/user.postgres.repository';
import { UserSchema } from '@module/iam/user/infrastructure/database/user.schema';
import { UserController } from '@module/iam/user/interface/user.controller';

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  controllers: [UserController],
  providers: [userRepositoryProvider, UserMapper, UserService],
  exports: [userRepositoryProvider, UserMapper],
})
export class UserModule {}

import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { UserDtoMapper } from '@iam/user/application/mapper/user-dto.mapper';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { ReadUserPolicyHandler } from '@iam/user/application/policy/read-user-policy.handler';
import { USER_REPOSITORY_KEY } from '@iam/user/application/repository/user.repository.interface';
import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';
import { userPermissions } from '@iam/user/domain/user.permission';
import { UserEntity } from '@iam/user/infrastructure/database/user.entity';
import { UserPostgresRepository } from '@iam/user/infrastructure/database/user.postgres.repository';
import { UserController } from '@iam/user/interface/user.controller';

const policyHandlersProviders = [ReadUserPolicyHandler];

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthorizationModule.forFeature(),
  ],
  controllers: [UserController],
  providers: [
    userRepositoryProvider,
    UserDtoMapper,
    UserMapper,
    UserService,
    ...policyHandlersProviders,
  ],
  exports: [userRepositoryProvider, UserDtoMapper, UserMapper],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(User, userPermissions);
  }
}

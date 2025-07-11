import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';
import { UserDtoMapper } from '@module/iam/user/application/mapper/user-dto.mapper';
import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import { ReadUserPolicyHandler } from '@module/iam/user/application/policy/read-user-policy.handler';
import { USER_REPOSITORY_KEY } from '@module/iam/user/application/repository/user.repository.interface';
import { UserService } from '@module/iam/user/application/service/user.service';
import { User } from '@module/iam/user/domain/user.entity';
import { userPermissions } from '@module/iam/user/domain/user.permission';
import { UserEntity } from '@module/iam/user/infrastructure/database/user.entity';
import { UserPostgresRepository } from '@module/iam/user/infrastructure/database/user.postgres.repository';
import { UserController } from '@module/iam/user/interface/user.controller';

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
  exports: [userRepositoryProvider, UserDtoMapper],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(User, userPermissions);
  }
}

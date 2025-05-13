import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import { USER_REPOSITORY_KEY } from '@module/iam/user/application/repository/user.repository.interface';
import { UserLinkBuilderService } from '@module/iam/user/application/service/link-builder/user-link-builder.service';
import { UserPostgresRepository } from '@module/iam/user/infrastructure/database/user.postgres.repository';
import { UserSchema } from '@module/iam/user/infrastructure/database/user.schema';

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [userRepositoryProvider, UserMapper, UserLinkBuilderService],
  exports: [userRepositoryProvider, UserMapper, UserLinkBuilderService],
})
export class UserModule {}

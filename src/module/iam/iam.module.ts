import { Module } from '@nestjs/common';

import { AuthenticationModule } from '@module/iam/authentication/authentication.module';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { UserModule } from '@module/iam/user/user.module';

@Module({
  imports: [UserModule, AuthenticationModule, AuthorizationModule.forRoot()],
})
export class IamModule {}

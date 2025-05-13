import { Module } from '@nestjs/common';

import { AuthenticationModule } from '@module/iam/authentication/authentication.module';
import { UserModule } from '@module/iam/user/user.module';

@Module({
  imports: [UserModule, AuthenticationModule],
})
export class IamModule {}

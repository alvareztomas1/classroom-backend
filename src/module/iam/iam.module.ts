import { Module } from '@nestjs/common';

import { UserModule } from '@module/iam/user/user.module';

@Module({
  imports: [UserModule],
})
export class IamModule {}

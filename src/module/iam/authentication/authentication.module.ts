import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthenticationService } from '@module/iam/authentication/application/service/authentication.service';
import { IDENTITY_PROVIDER_SERVICE_KEY } from '@module/iam/authentication/application/service/identity-provider.service.interface';
import { CognitoService } from '@module/iam/authentication/infrastructure/cognito/cognito.service';
import { AccessTokenGuard } from '@module/iam/authentication/infrastructure/guard/access-token.guard';
import { AuthenticationGuard } from '@module/iam/authentication/infrastructure/guard/authentication.guard';
import { JwtStrategy } from '@module/iam/authentication/infrastructure/passport/jwt.strategy';
import { AuthenticationController } from '@module/iam/authentication/interface/authentication.controller';
import { UserModule } from '@module/iam/user/user.module';

const authenticationRepositoryProvider: Provider = {
  provide: IDENTITY_PROVIDER_SERVICE_KEY,
  useClass: CognitoService,
};

@Module({
  imports: [UserModule],
  providers: [
    authenticationRepositoryProvider,
    AuthenticationService,
    JwtStrategy,
    AccessTokenGuard,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}

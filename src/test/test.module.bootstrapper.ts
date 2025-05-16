import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@module/app.module';
import { IDENTITY_PROVIDER_SERVICE_KEY } from '@module/iam/authentication/application/service/identity-provider.service.interface';

export const identityProviderServiceMock = {
  signUp: jest.fn(),
  confirmUser: jest.fn(),
  signIn: jest.fn(),
  forgotPassword: jest.fn(),
  confirmPassword: jest.fn(),
  resendConfirmationCode: jest.fn(),
};

export const testModuleBootstrapper = (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(IDENTITY_PROVIDER_SERVICE_KEY)
    .useValue(identityProviderServiceMock)
    .compile();
};

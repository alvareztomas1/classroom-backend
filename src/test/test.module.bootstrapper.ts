import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@module/app.module';
import { FILE_STORAGE_PROVIDER_SERVICE_KEY } from '@module/cloud/application/interface/file-storage-provider.interface';
import { IDENTITY_PROVIDER_SERVICE_KEY } from '@module/iam/authentication/application/service/identity-provider.service.interface';

export const identityProviderServiceMock = {
  signUp: jest.fn(),
  confirmUser: jest.fn(),
  signIn: jest.fn(),
  forgotPassword: jest.fn(),
  confirmPassword: jest.fn(),
  resendConfirmationCode: jest.fn(),
  refreshSession: jest.fn(),
};

export const fileStorageProviderServiceMock = {
  uploadFile: jest.fn(() => Promise.resolve('test-url')),
};

export const testModuleBootstrapper = (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(IDENTITY_PROVIDER_SERVICE_KEY)
    .useValue(identityProviderServiceMock)
    .overrideProvider(FILE_STORAGE_PROVIDER_SERVICE_KEY)
    .useValue(fileStorageProviderServiceMock)
    .compile();
};

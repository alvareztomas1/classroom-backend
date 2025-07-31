import { Test, TestingModule } from '@nestjs/testing';

import { FILE_STORAGE_PROVIDER_SERVICE_KEY } from '@cloud/application/interface/file-storage-provider.interface';

import { IDENTITY_PROVIDER_SERVICE_KEY } from '@iam/authentication/application/service/identity-provider.service.interface';

import { AppModule } from '@module/app.module';

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
  deleteFile: jest.fn(() => Promise.resolve()),
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

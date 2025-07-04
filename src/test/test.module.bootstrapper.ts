import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '@module/app.module';
import { Category } from '@module/category/domain/category.entity';
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
  deleteFile: jest.fn(() => Promise.resolve()),
};

export const mockTypeOrmRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
  softRemove: jest.fn(),
};

export const testModuleBootstrapper = (): Promise<TestingModule> => {
  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(IDENTITY_PROVIDER_SERVICE_KEY)
    .useValue(identityProviderServiceMock)
    .overrideProvider(FILE_STORAGE_PROVIDER_SERVICE_KEY)
    .useValue(fileStorageProviderServiceMock)
    .overrideProvider(getRepositoryToken(Category))
    .useValue(mockTypeOrmRepository)
    .compile();
};

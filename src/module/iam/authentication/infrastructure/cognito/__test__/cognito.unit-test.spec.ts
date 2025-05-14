import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { setupApp } from '@config/app.config';

import { AppModule } from '@module/app.module';
import { IDENTITY_PROVIDER_SERVICE_KEY } from '@module/iam/authentication/application/service/identity-provider.service.interface';
import { CognitoService } from '@module/iam/authentication/infrastructure/cognito/cognito.service';
import { CodeMismatchException } from '@module/iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
} from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { PasswordValidationException } from '@module/iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  SignUpCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ConfirmSignUpCommand: jest.fn((input) => input),
}));

describe('CognitoService', () => {
  let app: NestExpressApplication;

  let cognitoService: CognitoService;
  let clientMock: { send: jest.Mock };

  beforeAll(() => {
    process.env.COGNITO_USER_POOL_ID = 'mock-user-pool-id';
    process.env.COGNITO_CLIENT_ID = 'mock-client-id';
    process.env.COGNITO_ISSUER = 'mock-issuer';
    process.env.COGNITO_ENDPOINT = 'http://localhost:9229';
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);

    cognitoService = moduleRef.get<CognitoService>(
      IDENTITY_PROVIDER_SERVICE_KEY,
    );
    clientMock = (CognitoIdentityProviderClient as jest.Mock).mock.results[0]
      .value as { send: jest.Mock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CognitoService signUp method', () => {
    it('Should sign up a user successfully', async () => {
      const expectedUserSub = 'abc-123';
      const signUpCommand = {
        ClientId: 'mock-client-id',
        Username: 'test@example.com',
        Password: 'Password123!',
        UserAttributes: [{ Name: 'email', Value: 'test@example.com' }],
      };
      clientMock.send.mockResolvedValueOnce({ UserSub: expectedUserSub });

      const result = await cognitoService.signUp(
        'test@example.com',
        'Password123!',
      );
      expect(result).toEqual({ externalId: expectedUserSub });

      expect(SignUpCommand).toHaveBeenCalledWith(signUpCommand);

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(signUpCommand);
    });

    it('Should throw a PasswordValidationException if password is invalid', async () => {
      const error = new Error('Weak password');
      error.name = 'InvalidPasswordException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signUp('test@example.com', 'badpass'),
      ).rejects.toThrow(
        new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        }),
      );
    });

    it('Should throw a CouldNotSignUpException with an different error than PasswordValidationException', async () => {
      const error = new Error('Weak password');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signUp('test@example.com', 'password'),
      ).rejects.toThrow(
        new CouldNotSignUpException({
          message: error.message,
        }),
      );
    });
  });

  describe('CognitoService confirmUser method', () => {
    it('Should confirm an user successfully', async () => {
      const expectedResponse: ISuccessfulOperationResponse = {
        message: 'User successfully confirmed',
        success: true,
      };

      const confirmCommand = {
        ClientId: 'mock-client-id',
        Username: 'test@example.com',
        ConfirmationCode: '123456',
      };

      const result = await cognitoService.confirmUser(
        'test@example.com',
        '123456',
      );
      expect(result).toEqual(expectedResponse);

      expect(ConfirmSignUpCommand).toHaveBeenCalledWith(confirmCommand);

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(confirmCommand);
    });

    it('Should throw a CodeMismatchException if code is invalid', async () => {
      const error = new Error('CodeMismatchException');
      error.name = 'CodeMismatchException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmUser('test@example.com', 'invalid-code'),
      ).rejects.toThrow(
        new CodeMismatchException({
          message: CODE_MISMATCH_ERROR,
        }),
      );
    });

    it('Should throw a ExpiredCodeException if code is expired', async () => {
      const error = new Error('ExpiredCodeException');
      error.name = 'ExpiredCodeException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmUser('test@example.com', 'expired-code'),
      ).rejects.toThrow(
        new ExpiredCodeException({
          message: EXPIRED_CODE_ERROR,
        }),
      );
    });

    it('Should throw a UnexpectedErrorCodeException with an different error than CodeMismatchException or ExpiredCodeException', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmUser('test@example.com', '123456'),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });
  });
});

import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';

import { setupApp } from '@config/app.config';

import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { IDENTITY_PROVIDER_SERVICE_KEY } from '@iam/authentication/application/service/identity-provider.service.interface';
import { CognitoService } from '@iam/authentication/infrastructure/cognito/cognito.service';
import { CodeMismatchException } from '@iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { InvalidRefreshTokenException } from '@iam/authentication/infrastructure/cognito/exception/invalid-refresh-token.exception';
import { NewPasswordRequiredException } from '@iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';

import { AppModule } from '@module/app.module';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  SignUpCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ConfirmSignUpCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  InitiateAuthCommand: jest.fn((input) => input),
  AuthFlowType: {
    USER_PASSWORD_AUTH: 'test-user-password-auth',
    REFRESH_TOKEN_AUTH: 'test-refresh-token-auth',
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ForgotPasswordCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ConfirmForgotPasswordCommand: jest.fn((input) => input),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ResendConfirmationCodeCommand: jest.fn((input) => input),
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

  describe('CognitoService signIn method', () => {
    it('Should sign in a user successfully', async () => {
      jest.spyOn(clientMock, 'send').mockResolvedValueOnce({
        AuthenticationResult: {
          AccessToken: 'mock-access-token',
          RefreshToken: 'mock-refresh-token',
        },
      });
      const expectedUserSub = 'abc-123';
      const signInCommand = {
        ClientId: 'mock-client-id',
        AuthFlow: 'test-user-password-auth',
        AuthParameters: {
          USERNAME: 'test@example.com',
          PASSWORD: 'Password123!',
        },
      };
      clientMock.send.mockResolvedValueOnce({ UserSub: expectedUserSub });

      const result = await cognitoService.signIn(
        'test@example.com',
        'Password123!',
      );
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      expect(InitiateAuthCommand).toHaveBeenCalledTimes(1);
      expect(InitiateAuthCommand).toHaveBeenCalledWith(signInCommand);

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(signInCommand);
    });

    it('Should throw a UserNotConfirmedException if user is not confirmed', async () => {
      const error = new Error('UserNotConfirmedException');
      error.name = 'UserNotConfirmedException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signIn('test@example.com', 'Password123!'),
      ).rejects.toThrow(
        new UserNotConfirmedException({
          message: USER_NOT_CONFIRMED_ERROR,
        }),
      );
    });

    it('Should throw a InvalidPasswordException if password is invalid', async () => {
      const error = new Error('InvalidPasswordException');
      error.name = 'InvalidPasswordException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signIn('test@example.com', 'invalid-password'),
      ).rejects.toThrow(
        new InvalidPasswordException({
          message: INVALID_PASSWORD_ERROR,
        }),
      );
    });

    it('Should throw a NotAuthorizedException if user is not authorized', async () => {
      const error = new Error('NotAuthorizedException');
      error.name = 'NotAuthorizedException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signIn('test@example.com', 'Password123!'),
      ).rejects.toThrow(
        new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        }),
      );
    });

    it('Should throw a PasswordResetRequiredException if password is reset', async () => {
      const error = new Error('PasswordResetRequiredException');
      error.name = 'PasswordResetRequiredException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signIn('test@example.com', 'Password123!'),
      ).rejects.toThrow(
        new NewPasswordRequiredException({
          message: NEW_PASSWORD_REQUIRED_ERROR,
        }),
      );
    });

    it('Should throw a UnexpectedErrorCodeException with an different error than UserNotConfirmedException, InvalidPasswordException, NotAuthorizedException or PasswordResetRequiredException', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.signIn('test@example.com', 'Password123!'),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });
  });

  describe('CognitoService forgotPassword method', () => {
    it('Should send a forgot password request successfully', async () => {
      const forgotPasswordCommand = {
        ClientId: 'mock-client-id',
        Username: 'test@example.com',
      };

      const response = await cognitoService.forgotPassword('test@example.com');

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(forgotPasswordCommand);

      expect(ForgotPasswordCommand).toHaveBeenCalledTimes(1);
      expect(ForgotPasswordCommand).toHaveBeenCalledWith(forgotPasswordCommand);

      expect(response).toEqual({
        success: true,
        message: 'Password reset instructions have been sent',
      });
    });

    it('Should throw a UnexpectedErrorCodeException if an unexpected error occurs', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.forgotPassword('test@example.com'),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });
  });

  describe('CognitoService resetPassword method', () => {
    it('Should reset a password successfully', async () => {
      const resetPasswordCommand = {
        ClientId: 'mock-client-id',
        ConfirmationCode: '123456',
        Password: 'Password123!',
        Username: 'test@example.com',
      };

      const response = await cognitoService.confirmPassword(
        'test@example.com',
        'Password123!',
        '123456',
      );

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(resetPasswordCommand);

      expect(ConfirmForgotPasswordCommand).toHaveBeenCalledTimes(1);
      expect(ConfirmForgotPasswordCommand).toHaveBeenCalledWith(
        resetPasswordCommand,
      );

      expect(response).toEqual({
        success: true,
        message: 'Your password has been correctly updated',
      });
    });

    it('Should throw a UnexpectedErrorCodeException if an unexpected error occurs', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmPassword(
          'test@example.com',
          'Password123!',
          '123456',
        ),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });

    it('Should throw a ExpiredCodeException if code is expired', async () => {
      const error = new Error('ExpiredCodeException');
      error.name = 'ExpiredCodeException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmPassword(
          'test@example.com',
          'Password123!',
          '123456',
        ),
      ).rejects.toThrow(
        new ExpiredCodeException({
          message: EXPIRED_CODE_ERROR,
        }),
      );
    });

    it('Should throw a CodeMismatchException if code is invalid', async () => {
      const error = new Error('CodeMismatchException');
      error.name = 'CodeMismatchException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmPassword(
          'test@example.com',
          'Password123!',
          '123456',
        ),
      ).rejects.toThrow(
        new CodeMismatchException({
          message: CODE_MISMATCH_ERROR,
        }),
      );
    });

    it('Should throw a InvalidPasswordException if password is invalid', async () => {
      const error = new Error('InvalidPasswordException');
      error.name = 'InvalidPasswordException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.confirmPassword(
          'test@example.com',
          'Password123!',
          '123456',
        ),
      ).rejects.toThrow(
        new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        }),
      );
    });
  });

  describe('CognitoService resendConfirmationCode method', () => {
    it('Should resend a confirmation code successfully', async () => {
      const resendConfirmationCodeCommand = {
        ClientId: 'mock-client-id',
        Username: 'test@example.com',
      };

      const response =
        await cognitoService.resendConfirmationCode('test@example.com');

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(
        resendConfirmationCodeCommand,
      );

      expect(ResendConfirmationCodeCommand).toHaveBeenCalledTimes(1);
      expect(ResendConfirmationCodeCommand).toHaveBeenCalledWith(
        resendConfirmationCodeCommand,
      );

      expect(response).toEqual({
        success: true,
        message: 'A new confirmation code has been sent',
      });
    });

    it('Should throw a UnexpectedErrorCodeException if an unexpected error occurs', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.resendConfirmationCode('test@example.com'),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });
  });

  describe('CognitoService refreshSession method', () => {
    it('Should refresh a session successfully', async () => {
      const refreshSessionCommand = {
        ClientId: 'mock-client-id',
        AuthParameters: {
          REFRESH_TOKEN: 'mock-refresh-token',
        },
        AuthFlow: 'test-refresh-token-auth',
      };

      jest.spyOn(clientMock, 'send').mockResolvedValueOnce({
        AuthenticationResult: {
          AccessToken: 'mock-access-token',
        },
      });

      const response =
        await cognitoService.refreshSession('mock-refresh-token');

      expect(clientMock.send).toHaveBeenCalledTimes(1);
      expect(clientMock.send).toHaveBeenCalledWith(refreshSessionCommand);

      expect(InitiateAuthCommand).toHaveBeenCalledTimes(1);
      expect(InitiateAuthCommand).toHaveBeenCalledWith(refreshSessionCommand);

      expect(response).toEqual({
        accessToken: 'mock-access-token',
      });
    });

    it('Should throw a NotAuthorizedException when receiving a not authorized error', async () => {
      const error = new Error('NotAuthorizedException');
      error.name = 'NotAuthorizedException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.refreshSession('mock-refresh-token'),
      ).rejects.toThrow(
        new InvalidRefreshTokenException({
          message: INVALID_REFRESH_TOKEN_ERROR,
        }),
      );
    });

    it('Should throw a UnexpectedErrorCodeException if an unexpected error occurs', async () => {
      const error = new Error('SomeOtherException');
      error.name = 'SomeOtherException';
      clientMock.send.mockRejectedValueOnce(error);

      await expect(
        cognitoService.refreshSession('mock-refresh-token'),
      ).rejects.toThrow(
        new UnexpectedErrorCodeException({
          message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${error.name}`,
        }),
      );
    });
  });
});

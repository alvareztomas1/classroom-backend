import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { ISignInResponse } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { ISignUpResponse } from '@module/iam/authentication/application/dto/sign-up-response.interface';
import { IIdentityProviderService } from '@module/iam/authentication/application/service/identity-provider.service.interface';
import { CodeMismatchException } from '@module/iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@module/iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { NewPasswordRequiredException } from '@module/iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@module/iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@module/iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';

@Injectable()
export class CognitoService implements IIdentityProviderService {
  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get('cognito.clientId');
    this.client = new CognitoIdentityProviderClient({
      endpoint: this.configService.get('cognito.endpoint'),
    });
  }

  async signUp(email: string, password: string): Promise<ISignUpResponse> {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      const result = await this.client.send(command);
      return { externalId: result.UserSub };
    } catch (error) {
      if ((error as Error).name === 'InvalidPasswordException') {
        throw new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        });
      }
      throw new CouldNotSignUpException({
        message: (error as Error).message,
      });
    }
  }

  async signIn(username: string, password: string): Promise<ISignInResponse> {
    try {
      const input: InitiateAuthCommandInput = {
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      };

      const command = new InitiateAuthCommand(input);
      const result = await this.client.send(command);

      return {
        accessToken: result.AuthenticationResult.AccessToken,
        refreshToken: result.AuthenticationResult.RefreshToken,
      };
    } catch (error) {
      switch ((error as Error).name) {
        case 'UserNotConfirmedException':
          throw new UserNotConfirmedException({
            message: USER_NOT_CONFIRMED_ERROR,
          });
        case 'InvalidPasswordException':
          throw new InvalidPasswordException({
            message: INVALID_PASSWORD_ERROR,
          });
        case 'NotAuthorizedException':
          throw new PasswordValidationException({
            message: PASSWORD_VALIDATION_ERROR,
          });
        case 'PasswordResetRequiredException':
          throw new NewPasswordRequiredException({
            message: NEW_PASSWORD_REQUIRED_ERROR,
          });
        default:
          throw new UnexpectedErrorCodeException({
            message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${(error as Error).name}`,
          });
      }
    }
  }

  async confirmUser(
    email: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: code,
      });

      await this.client.send(command);
      return {
        success: true,
        message: 'User successfully confirmed',
      };
    } catch (error) {
      switch ((error as Error).name) {
        case 'CodeMismatchException':
          throw new CodeMismatchException({
            message: CODE_MISMATCH_ERROR,
          });
        case 'ExpiredCodeException':
          throw new ExpiredCodeException({
            message: EXPIRED_CODE_ERROR,
          });
        default:
          throw new UnexpectedErrorCodeException({
            message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${(error as Error).name}`,
          });
      }
    }
  }

  async forgotPassword(email: string): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.client.send(command);

      return {
        success: true,
        message: 'Password reset instructions have been sent',
      };
    } catch (error) {
      throw new UnexpectedErrorCodeException({
        message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${(error as Error).name}`,
      });
    }
  }
}

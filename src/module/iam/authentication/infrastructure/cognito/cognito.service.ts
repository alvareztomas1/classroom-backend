import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ISignUpResponse } from '@module/iam/authentication/application/dto/sign-up-response.interface';
import { IIdentityProviderService } from '@module/iam/authentication/application/service/identity-provider.service.interface';
import { PASSWORD_VALIDATION_ERROR } from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { PasswordValidationException } from '@module/iam/authentication/infrastructure/cognito/exception/password-validation.exception';

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
}

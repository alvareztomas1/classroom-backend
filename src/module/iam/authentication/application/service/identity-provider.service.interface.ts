import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { IRefreshSessionResponse } from '@module/iam/authentication/application/dto/refresh-session-response.dto';
import { ISignInResponse } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { ISignUpResponse } from '@module/iam/authentication/application/dto/sign-up-response.interface';

export const IDENTITY_PROVIDER_SERVICE_KEY = 'identity_provider_service';

export interface IIdentityProviderService {
  signUp(email: string, password: string): Promise<ISignUpResponse>;
  confirmUser(
    email: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse>;
  signIn(email: string, password: string): Promise<ISignInResponse>;
  forgotPassword(email: string): Promise<ISuccessfulOperationResponse>;
  confirmPassword(
    email: string,
    newPassword: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse>;
  resendConfirmationCode(email: string): Promise<ISuccessfulOperationResponse>;
  refreshSession(refreshToken: string): Promise<IRefreshSessionResponse>;
}

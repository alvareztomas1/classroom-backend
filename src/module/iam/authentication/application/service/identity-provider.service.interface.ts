import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { ISignUpResponse } from '@module/iam/authentication/application/dto/sign-up-response.interface';

export const IDENTITY_PROVIDER_SERVICE_KEY = 'identity_provider_service';

export interface IIdentityProviderService {
  signUp(email: string, password: string): Promise<ISignUpResponse>;
  confirmUser(
    email: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse>;
}

import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

export interface ISignInResponse {
  accessToken: string;
  refreshToken: string;
}
export class SignInResponseDto
  extends BaseResponseDto
  implements ISignInResponse
{
  accessToken: string;
  refreshToken: string;
}

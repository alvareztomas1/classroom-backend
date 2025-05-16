import { IsNotEmpty, IsString } from 'class-validator';

import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';

export interface IRefreshSessionResponse {
  accessToken: string;
}

export class RefreshSessionResponseDto
  extends BaseResponseDto
  implements IRefreshSessionResponse
{
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  constructor(accessToken: string, type: string) {
    super(type);
    this.accessToken = accessToken;
  }
}

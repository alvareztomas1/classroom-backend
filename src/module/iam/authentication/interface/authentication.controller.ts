import { Body, Controller, Post } from '@nestjs/common';

import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';

import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import { AuthenticationService } from '@module/iam/authentication/application/service/authentication.service';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async handleSignUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<SerializedResponseDto<UserResponseDto>> {
    return this.authenticationService.handleSignUp(signUpDto);
  }
}

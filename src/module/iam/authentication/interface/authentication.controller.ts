import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import { AuthenticationService } from '@module/iam/authentication/application/service/authentication.service';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async handleSignUp(@Body() signUpDto: SignUpDto): Promise<UserResponseDto> {
    return this.authenticationService.handleSignUp(signUpDto);
  }

  @Post('confirm-user')
  @HttpCode(HttpStatus.OK)
  async confirmUser(
    @Body() confirmUserDto: ConfirmUserDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleConfirmUser(confirmUserDto);
  }
}

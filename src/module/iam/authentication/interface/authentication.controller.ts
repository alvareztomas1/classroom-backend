import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { ConfirmPasswordDto } from '@module/iam/authentication/application/dto/confirm-password.dto';
import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
import { ForgotPasswordDto } from '@module/iam/authentication/application/dto/forgot-password.dto';
import { RefreshSessionResponseDto } from '@module/iam/authentication/application/dto/refresh-session-response.dto';
import { RefreshSessionDto } from '@module/iam/authentication/application/dto/refresh-session.dto';
import { ResendConfirmationCodeDto } from '@module/iam/authentication/application/dto/resend-confirmation-code.dto';
import { SignInResponseDto } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { SignInDto } from '@module/iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import { AuthenticationService } from '@module/iam/authentication/application/service/authentication.service';
import { AuthType } from '@module/iam/authentication/domain/auth-type.enum';
import { Auth } from '@module/iam/authentication/infrastructure/decorator/auth.decorator';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  @Hypermedia([
    {
      rel: 'confirm-user',
      endpoint: '/auth/confirm-user',
      method: HttpMethod.POST,
    },
    {
      rel: 'sign-in',
      endpoint: '/auth/sign-in',
      method: HttpMethod.POST,
    },
  ])
  async handleSignUp(@Body() signUpDto: SignUpDto): Promise<UserResponseDto> {
    return this.authenticationService.handleSignUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async handleSignIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authenticationService.handleSignIn(signInDto);
  }

  @Post('confirm-user')
  @Hypermedia([
    {
      rel: 'sign-in',
      endpoint: '/auth/sign-in',
      method: HttpMethod.POST,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async confirmUser(
    @Body() confirmUserDto: ConfirmUserDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleConfirmUser(confirmUserDto);
  }

  @Post('forgot-password')
  @Hypermedia([
    {
      rel: 'confirm-password',
      endpoint: '/auth/confirm-password',
      method: HttpMethod.POST,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async handleForgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleForgotPassword(forgotPasswordDto);
  }

  @Post('confirm-password')
  @Hypermedia([
    {
      rel: 'resend-confirmation-code',
      endpoint: '/auth/resend-confirmation-code',
      method: HttpMethod.POST,
    },
    {
      rel: 'sign-in',
      endpoint: '/auth/sign-in',
      method: HttpMethod.POST,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async handleConfirmPassword(
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleConfirmPassword(confirmPasswordDto);
  }

  @Post('resend-confirmation-code')
  @Hypermedia([
    {
      rel: 'confirm-password',
      endpoint: '/auth/confirm-password',
      method: HttpMethod.POST,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async handleResendConfirmationCode(
    @Body() resendConfirmationCode: ResendConfirmationCodeDto,
  ): Promise<ISuccessfulOperationResponse> {
    return this.authenticationService.handleResendConfirmationCode(
      resendConfirmationCode,
    );
  }

  @Post('refresh')
  @Hypermedia([
    {
      rel: 'sign-in',
      endpoint: '/auth/sign-in',
      method: HttpMethod.POST,
    },
  ])
  @HttpCode(HttpStatus.OK)
  async handleRefreshSession(
    @Body() refreshSessionDto: RefreshSessionDto,
  ): Promise<RefreshSessionResponseDto> {
    return this.authenticationService.handleRefreshSession(refreshSessionDto);
  }
}

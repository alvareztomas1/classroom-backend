import { Inject, Injectable } from '@nestjs/common';

import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';

import { AVATARS_FOLDER } from '@module/cloud/application/constants/image-storage-folders.constants';
import { ImageStorageService } from '@module/cloud/application/service/image-storage.service';
import { ConfirmPasswordDto } from '@module/iam/authentication/application/dto/confirm-password.dto';
import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
import { ForgotPasswordDto } from '@module/iam/authentication/application/dto/forgot-password.dto';
import { RefreshSessionResponseDto } from '@module/iam/authentication/application/dto/refresh-session-response.dto';
import { RefreshSessionDto } from '@module/iam/authentication/application/dto/refresh-session.dto';
import { ResendConfirmationCodeDto } from '@module/iam/authentication/application/dto/resend-confirmation-code.dto';
import { SignInResponseDto } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { SignInDto } from '@module/iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import {
  SIGNUP_CONFLICT_TITLE,
  USER_ALREADY_CONFIRMED_ERROR,
  USER_ALREADY_SIGNED_UP_ERROR,
} from '@module/iam/authentication/application/exception/authentication-exception-messages';
import { UserAlreadyConfirmed } from '@module/iam/authentication/application/exception/user-already-confirmed.exception';
import { UserAlreadySignedUp } from '@module/iam/authentication/application/exception/user-already-signed-up.exception';
import {
  IDENTITY_PROVIDER_SERVICE_KEY,
  IIdentityProviderService,
} from '@module/iam/authentication/application/service/identity-provider.service.interface';
import { AUTHENTICATION_NAME } from '@module/iam/authentication/domain/authentication.name';
import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserMapper } from '@module/iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@module/iam/user/application/repository/user.repository.interface';
import { User } from '@module/iam/user/domain/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(IDENTITY_PROVIDER_SERVICE_KEY)
    private readonly identityProviderService: IIdentityProviderService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async handleSignUp(
    signUpDto: SignUpDto,
    avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    signUpDto.avatarUrl = avatar
      ? await this.imageStorageService.uploadImage(avatar, AVATARS_FOLDER)
      : null;
    const { email, password, firstName, lastName, avatarUrl } = signUpDto;

    const existingUser = await this.userRepository.getOneByEmail(email);

    if (!existingUser) {
      return this.signUpAndSave(
        email,
        password,
        firstName,
        lastName,
        avatarUrl,
      );
    }

    if (!existingUser.externalId) {
      return this.signUpAndSave(
        email,
        password,
        firstName,
        lastName,
        avatarUrl,
        existingUser.id,
      );
    }

    throw new UserAlreadySignedUp({
      message: USER_ALREADY_SIGNED_UP_ERROR,
      title: SIGNUP_CONFLICT_TITLE,
    });
  }

  async handleSignIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    const { email, password } = signInDto;
    const existingUser = await this.userRepository.getOneByEmailOrFail(email);

    const response = await this.identityProviderService.signIn(
      existingUser.email,
      password,
    );

    return {
      ...response,
      type: AUTHENTICATION_NAME,
    };
  }

  async handleConfirmUser(
    confirmUserDto: ConfirmUserDto,
  ): Promise<SuccessOperationResponseDto> {
    const { email, code } = confirmUserDto;
    const existingUser = await this.userRepository.getOneByEmailOrFail(email);

    if (existingUser.isVerified) {
      throw new UserAlreadyConfirmed({
        message: USER_ALREADY_CONFIRMED_ERROR,
      });
    }

    const confirmUserResponse = await this.identityProviderService.confirmUser(
      existingUser.email,
      code,
    );

    await this.userRepository.updateOneOrFail(existingUser.id, {
      isVerified: true,
    });

    return new SuccessOperationResponseDto(
      confirmUserResponse.message,
      confirmUserResponse.success,
      AUTHENTICATION_NAME,
    );
  }

  async handleForgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<SuccessOperationResponseDto> {
    const { email } = forgotPasswordDto;
    const existingUser = await this.userRepository.getOneByEmailOrFail(email);

    const response = await this.identityProviderService.forgotPassword(
      existingUser.email,
    );

    return new SuccessOperationResponseDto(
      response.message,
      response.success,
      AUTHENTICATION_NAME,
    );
  }

  async handleConfirmPassword(
    confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<SuccessOperationResponseDto> {
    const { email, newPassword, code } = confirmPasswordDto;
    const existingUser = await this.userRepository.getOneByEmailOrFail(email);

    const response = await this.identityProviderService.confirmPassword(
      existingUser.email,
      newPassword,
      code,
    );

    return new SuccessOperationResponseDto(
      response.message,
      response.success,
      AUTHENTICATION_NAME,
    );
  }

  async handleResendConfirmationCode(
    resendConfirmationCodeDto: ResendConfirmationCodeDto,
  ): Promise<SuccessOperationResponseDto> {
    const { email } = resendConfirmationCodeDto;
    const existingUser = await this.userRepository.getOneByEmailOrFail(email);

    const response = await this.identityProviderService.resendConfirmationCode(
      existingUser.email,
    );

    return new SuccessOperationResponseDto(
      response.message,
      response.success,
      AUTHENTICATION_NAME,
    );
  }

  async handleRefreshSession(
    refreshSessionDto: RefreshSessionDto,
  ): Promise<RefreshSessionResponseDto> {
    const { email, refreshToken } = refreshSessionDto;

    await this.userRepository.getOneByEmailOrFail(email);

    const response =
      await this.identityProviderService.refreshSession(refreshToken);

    return new RefreshSessionResponseDto(
      response.accessToken,
      AUTHENTICATION_NAME,
    );
  }

  private async signUpAndSave(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatarUrl?: string,
    userId?: string,
  ): Promise<UserResponseDto> {
    let userToSaveId = userId;

    if (!userToSaveId) {
      userToSaveId = (
        await this.userRepository.saveOne(
          new User(email, firstName, lastName, [AppRole.Regular], avatarUrl),
        )
      ).id;
    }

    const { externalId } = await this.identityProviderService.signUp(
      email,
      password,
    );

    const user = await this.userRepository.updateOneOrFail(userToSaveId, {
      externalId,
    });

    return this.userMapper.fromEntityToResponseDto(user);
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { ISuccessfulOperationResponse } from '@common/base/application/dto/successful-operation-response.interface';

import { ResponseSerializerService } from '@module/app/service/response-serializer.service';
import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
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
    private readonly responseSerializerService: ResponseSerializerService,
  ) {}

  async handleSignUp(
    signUpDto: SignUpDto,
  ): Promise<SerializedResponseDto<UserResponseDto>> {
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

  async handleConfirmUser(
    confirmUserDto: ConfirmUserDto,
  ): Promise<SerializedResponseDto<ISuccessfulOperationResponse>> {
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

    return this.responseSerializerService.serializeResponseDto({
      responseDto: confirmUserResponse,
      entityName: AUTHENTICATION_NAME,
    });
  }

  private async signUpAndSave(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatarUrl?: string,
    userId?: string,
  ): Promise<SerializedResponseDto<UserResponseDto>> {
    let userToSaveId = userId;

    if (!userToSaveId) {
      userToSaveId = (
        await this.userRepository.saveOne(
          new User(email, firstName, lastName, AppRole.Regular, avatarUrl),
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

    return this.responseSerializerService.serializeResponseDto({
      responseDto: this.userMapper.fromEntityToResponseDto(user),
      id: user.id,
      entityName: User.getEntityName(),
    });
  }
}

import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/query-params/page-query-params';
import { ImageFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { FileOptionsFactory } from '@common/base/application/factory/file-options.factory';

import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';
import { UpdateUserDtoQuery } from '@iam/user/application/dto/update-user.dto';
import { UserFieldsQueryParamsDto } from '@iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@iam/user/application/dto/user-sort-query-params.dto';
import { ReadUserPolicyHandler } from '@iam/user/application/policy/read-user-policy.handler';
import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';

@Controller('user')
@UseInterceptors(
  FileInterceptor(
    'avatar',
    FileOptionsFactory.create('avatar', Object.values(ImageFormat)),
  ),
)
@UseGuards(PoliciesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Policies(ReadUserPolicyHandler)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: UserFilterQueryParamsDto,
    @Query('fields') fields: UserFieldsQueryParamsDto,
    @Query('sort') sort: UserSortQueryParamsDto,
  ): Promise<CollectionDto<UserResponseDto>> {
    return await this.userService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
    });
  }

  @Get('me')
  @Hypermedia([
    {
      endpoint: '/user/me',
      method: HttpMethod.PATCH,
      rel: 'update-me',
    },
    {
      endpoint: '/user',
      method: HttpMethod.GET,
      rel: 'get-all',
      action: AppAction.Read,
      subject: User,
    },
  ])
  getMe(@CurrentUser() user: User): UserResponseDto {
    return this.userService.getMe(user);
  }

  @Patch('me')
  @Hypermedia([
    {
      endpoint: '/user/me',
      method: HttpMethod.GET,
      rel: 'get-me',
    },
  ])
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDtoQuery,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return await this.userService.updateMe(user, updateUserDto, avatar);
  }
}

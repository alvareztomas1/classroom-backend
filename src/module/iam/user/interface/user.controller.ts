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
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { ImageOptionsFactory } from '@common/base/application/factory/image-options.factory';

import { CurrentUser } from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { Policies } from '@module/iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';
import { UpdateUserDtoQuery } from '@module/iam/user/application/dto/update-user.dto';
import { UserFieldsQueryParamsDto } from '@module/iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@module/iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@module/iam/user/application/dto/user-sort-query-params.dto';
import { ReadUserPolicyHandler } from '@module/iam/user/application/policy/read-user-policy.handler';
import { UserService } from '@module/iam/user/application/service/user.service';
import { User } from '@module/iam/user/domain/user.entity';

@Controller('user')
@UseInterceptors(
  FileInterceptor('avatar', ImageOptionsFactory.create('avatar')),
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

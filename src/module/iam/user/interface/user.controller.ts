import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';

import { CurrentUser } from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { Policies } from '@module/iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';
import { UpdateUserDto } from '@module/iam/user/application/dto/update-user.dto';
import { UserFieldsQueryParamsDto } from '@module/iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@module/iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@module/iam/user/application/dto/user-sort-query-params.dto';
import { ReadUserPolicyHandler } from '@module/iam/user/application/policy/read-user-policy.handler';
import { UserService } from '@module/iam/user/application/service/user.service';
import { User } from '@module/iam/user/domain/user.entity';

@UseGuards(PoliciesGuard)
@Controller('user')
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
  getMe(@CurrentUser() user: User): UserResponseDto {
    return this.userService.getMe(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateMe(user, updateUserDto);
  }
}

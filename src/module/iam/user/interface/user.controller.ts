import { Controller, Get, Query } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';

import { CurrentUser } from '@module/iam/authentication/infrastructure/decorator/current-user.decorator';
import { UserFieldsQueryParamsDto } from '@module/iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@module/iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@module/iam/user/application/dto/user-sort-query-params.dto';
import { UserService } from '@module/iam/user/application/service/user.service';
import { User } from '@module/iam/user/domain/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
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
}

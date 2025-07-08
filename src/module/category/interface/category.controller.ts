import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { CategoryFieldsQueryParamsDto } from '@module/category/application/dto/query-params/category-fields-query-params.dto';
import { CategoryFilterQueryParamsDto } from '@module/category/application/dto/query-params/category-filter-query-params.dto';
import { CategorySortQueryParamsDto } from '@module/category/application/dto/query-params/category-sort-query-params.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CreateCategoryPolicyHandler } from '@module/category/application/policy/create-category-policy.handler';
import { DeleteCategoryPolicyHandler } from '@module/category/application/policy/delete-category-policy.handler';
import { UpdateCategoryPolicyHandler } from '@module/category/application/policy/update-category-policy.handler';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';
import { Policies } from '@module/iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@module/iam/authorization/infrastructure/policy/guard/policy.guard';

@Controller('category')
@UseGuards(PoliciesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryCRUDService) {}

  @Get()
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: CategoryFilterQueryParamsDto,
    @Query('fields') fields: CategoryFieldsQueryParamsDto,
    @Query('sort') sort: CategorySortQueryParamsDto,
  ): Promise<CollectionDto<CategoryResponseDto>> {
    return await this.categoryService.getAll({
      page,
      filter,
      fields: fields.target,
      sort,
    });
  }

  @Get(':id')
  @Hypermedia([
    {
      endpoint: '/category',
      rel: 'create-category',
      method: HttpMethod.POST,
    },
    {
      endpoint: '/category/:id',
      rel: 'update-category',
      method: HttpMethod.PATCH,
    },
    {
      endpoint: '/category/:id',
      rel: 'delete-category',
      method: HttpMethod.DELETE,
    },
  ])
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getOneByIdOrFail(id);
  }

  @Get(':id/children')
  @Hypermedia([
    {
      endpoint: '/category',
      rel: 'create-category',
      method: HttpMethod.POST,
    },
    {
      endpoint: '/category/:id',
      rel: 'update-category',
      method: HttpMethod.PATCH,
    },
    {
      endpoint: '/category/:id',
      rel: 'delete-category',
      method: HttpMethod.DELETE,
    },
  ])
  async getChildrenById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getChildrenByIdOrFail(id);
  }

  @Post()
  @Hypermedia([
    {
      endpoint: '/category/:id',
      rel: 'get-category',
      method: HttpMethod.GET,
    },
    {
      endpoint: '/category/:id',
      rel: 'update-category',
      method: HttpMethod.PATCH,
    },
    {
      endpoint: '/category/:id',
      rel: 'delete-category',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(CreateCategoryPolicyHandler)
  async saveOne(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.saveOne(createCategoryDto);
  }

  @Patch(':id')
  @Hypermedia([
    {
      endpoint: '/category/:id',
      rel: 'get-category',
      method: HttpMethod.GET,
    },
    {
      endpoint: '/category/:id',
      rel: 'create-category',
      method: HttpMethod.POST,
    },
    {
      endpoint: '/category/:id',
      rel: 'delete-category',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(UpdateCategoryPolicyHandler)
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.updateOne(id, updateCategoryDto);
  }

  @Delete(':id')
  @Hypermedia([
    {
      endpoint: '/category/:id',
      rel: 'create-category',
      method: HttpMethod.POST,
    },
  ])
  @Policies(DeleteCategoryPolicyHandler)
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.categoryService.deleteOneByIdOrFail(id);
  }
}

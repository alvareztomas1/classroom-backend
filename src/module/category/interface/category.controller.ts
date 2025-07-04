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
} from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { CategoryFieldsQueryParamsDto } from '@module/category/application/dto/query-params/category-fields-query-params.dto';
import { CategoryFilterQueryParamsDto } from '@module/category/application/dto/query-params/category-filter-query-params.dto';
import { CategoryIncludeQueryDto } from '@module/category/application/dto/query-params/category-include-query-param.dto';
import { CategorySortQueryParamsDto } from '@module/category/application/dto/query-params/category-sort-query-params.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryCRUDService) {}

  @Get()
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: CategoryFilterQueryParamsDto,
    @Query('fields') fields: CategoryFieldsQueryParamsDto,
    @Query('sort') sort: CategorySortQueryParamsDto,
    @Query('include') include: CategoryIncludeQueryDto,
  ): Promise<CollectionDto<CategoryResponseDto>> {
    return await this.categoryService.getAll({
      page,
      filter,
      fields: fields.target,
      sort,
      include: include.target,
    });
  }

  @Get(':id')
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('include') include: CategoryIncludeQueryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getOneByIdOrFail(id, include.target);
  }

  @Post()
  async saveOne(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.saveOne(createCategoryDto);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.updateOne(id, updateCategoryDto);
  }

  @Delete(':id')
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.categoryService.deleteOneByIdOrFail(id);
  }
}

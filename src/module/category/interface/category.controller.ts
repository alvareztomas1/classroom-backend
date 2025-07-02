import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryCRUDService) {}

  @Get(':id')
  async getOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return await this.categoryService.getOneByIdOrFail(id);
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

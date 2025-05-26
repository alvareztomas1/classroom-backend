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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { ImageOptionsFactory } from '@common/base/application/factory/image-options.factory';

import { CourseFieldsQueryParamsDto } from '@module/course/application/dto/course-fields-query-params.dto';
import { CourseFilterQueryParamsDto } from '@module/course/application/dto/course-filter-query-params.dto';
import { CourseResponseDto } from '@module/course/application/dto/course-response.dto';
import { CourseSortQueryParamsDto } from '@module/course/application/dto/course-sort-query-params.dto';
import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@module/course/application/dto/update-course.dto';
import { CourseService } from '@module/course/application/service/course.service';

@UseInterceptors(FileInterceptor('image', ImageOptionsFactory.create('image')))
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: CourseFilterQueryParamsDto,
    @Query('fields') fields: CourseFieldsQueryParamsDto,
    @Query('sort') sort: CourseSortQueryParamsDto,
  ): Promise<CollectionDto<CourseResponseDto>> {
    return await this.courseService.getAll({
      page,
      filter,
      fields: fields.target,
      sort,
    });
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourseResponseDto> {
    return await this.courseService.getOneByIdOrFail(id);
  }

  @Post()
  async saveOne(
    @Body() createDto: CreateCourseDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    return await this.courseService.saveOne(createDto, image);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCourseDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    return await this.courseService.updateOne(id, updateDto, image);
  }

  @Delete(':id')
  async deleteOneByIdOrFail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.courseService.deleteOneByIdOrFail(id);
  }
}

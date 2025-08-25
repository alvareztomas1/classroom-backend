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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/query-params/page-query-params';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { ImageFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { FileOptionsFactory } from '@common/base/application/factory/file-options.factory';

import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { AppAction } from '@iam/authorization/domain/app.action.enum';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';
import { User } from '@iam/user/domain/user.entity';

import { CourseResponseDto } from '@course/application/dto/course-response.dto';
import { CreateCourseRequestDto } from '@course/application/dto/create-course.dto';
import { CourseFieldsQueryParamsDto } from '@course/application/dto/query-params/course-fields-query-params.dto';
import { CourseFilterQueryParamsDto } from '@course/application/dto/query-params/course-filter-query-params.dto';
import { CourseIncludeQueryDto } from '@course/application/dto/query-params/course-include.dto';
import { CourseSortQueryParamsDto } from '@course/application/dto/query-params/course-sort-query-params.dto';
import { UpdateCourseDto } from '@course/application/dto/update-course.dto';
import { CreateCoursePolicyHandler } from '@course/application/policy/create-course-policy-handler';
import { DeleteCoursePolicyHandler } from '@course/application/policy/delete-course-policy-handler';
import { UpdateCoursePolicyHandler } from '@course/application/policy/update-course-policy.handler';
import { CourseService } from '@course/application/service/course.service';
import { Course } from '@course/domain/course.entity';

@Controller('course')
@UseInterceptors(
  FileInterceptor(
    'image',
    FileOptionsFactory.create('image', Object.values(ImageFormat)),
  ),
)
@UseGuards(PoliciesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: CourseFilterQueryParamsDto,
    @Query('fields') fields: CourseFieldsQueryParamsDto,
    @Query('sort') sort: CourseSortQueryParamsDto,
    @Query('include') include: CourseIncludeQueryDto,
  ): Promise<CollectionDto<CourseResponseDto>> {
    return await this.courseService.getAll({
      page,
      filter,
      fields: fields.target,
      sort,
      include: include.target,
    });
  }

  @Get(':id')
  @Hypermedia([
    {
      rel: 'get-all',
      endpoint: '/course',
      method: HttpMethod.GET,
      action: AppAction.Read,
      subject: Course,
    },
    {
      rel: 'create',
      endpoint: '/course',
      method: HttpMethod.POST,
      action: AppAction.Create,
      subject: Course,
    },
    {
      rel: 'update',
      endpoint: '/course/:id',
      method: HttpMethod.PATCH,
      action: AppAction.Update,
      subject: Course,
    },
    {
      rel: 'delete',
      endpoint: '/course/:id',
      method: HttpMethod.DELETE,
      action: AppAction.Delete,
      subject: Course,
    },
  ])
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('include') include: CourseIncludeQueryDto,
  ): Promise<CourseResponseDto> {
    return await this.courseService.getOneByIdOrFail(id, include.target);
  }

  @Post()
  @Hypermedia([
    {
      rel: 'get',
      endpoint: '/course/:id',
      method: HttpMethod.GET,
    },
    {
      rel: 'update',
      endpoint: '/course/:id',
      method: HttpMethod.PATCH,
    },
    {
      rel: 'delete',
      endpoint: '/course/:id',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(CreateCoursePolicyHandler)
  async saveOne(
    @Body() createDto: CreateCourseRequestDto,
    @CurrentUser() user: User,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    return await this.courseService.saveOne(
      { ...createDto, instructorId: user.id as string },
      image,
    );
  }

  @Patch(':id')
  @Hypermedia([
    {
      rel: 'get',
      endpoint: '/course/:id',
      method: HttpMethod.GET,
    },
    {
      rel: 'delete',
      endpoint: '/course/:id',
      method: HttpMethod.DELETE,
    },
  ])
  @Policies(UpdateCoursePolicyHandler)
  async updateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCourseDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    return await this.courseService.updateOne(id, updateDto, image);
  }

  @Delete(':id')
  @Hypermedia([
    {
      rel: 'get-all',
      endpoint: '/course',
      method: HttpMethod.GET,
    },
    {
      rel: 'create',
      endpoint: '/course',
      method: HttpMethod.POST,
    },
  ])
  @Policies(DeleteCoursePolicyHandler)
  async deleteOneByIdOrFail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.courseService.deleteOneByIdOrFail(id);
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Hypermedia } from '@common/base/application/decorator/hypermedia.decorator';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { FileFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { FileOptionsFactory } from '@common/base/application/factory/file-options.factory';

import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PoliciesGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';

import { CreateLessonDtoQuery } from '@lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@lesson/application/dto/update-lesson.dto';
import { CreateLessonPolicyHandler } from '@lesson/application/policy/create-lesson-policy.handler';
import { DeleteLessonPolicyHandler } from '@lesson/application/policy/delete-lession-policy.handler';
import { UpdateLessonPolicyHandler } from '@lesson/application/policy/update-lesson-policy.handler';
import { LessonService } from '@lesson/application/service/lesson.service';

@Controller('course/:courseId/section/:sectionId/lesson')
@UseGuards(PoliciesGuard)
@UseInterceptors(
  FileInterceptor(
    'file',
    FileOptionsFactory.create('file', Object.values(FileFormat)),
  ),
)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get(':id')
  @Hypermedia([
    {
      method: HttpMethod.POST,
      rel: 'create-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson',
    },
    {
      method: HttpMethod.PATCH,
      rel: 'update-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
    {
      method: HttpMethod.DELETE,
      rel: 'delete-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
  ])
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('courseId', ParseUUIDPipe) _courseId: string,
    @Param('sectionId', ParseUUIDPipe) _sectionId: string,
  ): Promise<LessonResponseDto> {
    return await this.lessonService.getOneByIdOrFail(id);
  }

  @Post()
  @Policies(CreateLessonPolicyHandler)
  @Hypermedia([
    {
      method: HttpMethod.GET,
      rel: 'get-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
    {
      method: HttpMethod.PATCH,
      rel: 'update-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
    {
      method: HttpMethod.DELETE,
      rel: 'delete-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
  ])
  async saveOne(
    @Body() createLessonDto: CreateLessonDtoQuery,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    return await this.lessonService.saveOne(
      { ...createLessonDto, courseId, sectionId },
      file,
    );
  }

  @Patch(':id')
  @Policies(UpdateLessonPolicyHandler)
  @Hypermedia([
    {
      method: HttpMethod.GET,
      rel: 'get-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
    {
      method: HttpMethod.POST,
      rel: 'create-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson',
    },
    {
      method: HttpMethod.DELETE,
      rel: 'delete-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson/:id',
    },
  ])
  async updateOne(
    @Body() updateLessonDto: UpdateLessonDto,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    return await this.lessonService.updateOne(
      id,
      { ...updateLessonDto, courseId, sectionId },
      file,
    );
  }

  @Delete(':id')
  @Policies(DeleteLessonPolicyHandler)
  @Hypermedia([
    {
      method: HttpMethod.POST,
      rel: 'create-lesson',
      endpoint: '/course/:courseId/section/:sectionId/lesson',
    },
  ])
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('courseId', ParseUUIDPipe) _courseId: string,
    @Param('sectionId', ParseUUIDPipe) _sectionId: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.lessonService.deleteOneByIdOrFail(id);
  }
}

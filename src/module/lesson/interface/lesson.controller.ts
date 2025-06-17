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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';

import { CreateLessonDtoQuery } from '@module/lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@module/lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@module/lesson/application/dto/update-lesson.dto';
import { LessonService } from '@module/lesson/application/service/lesson.service';

@Controller('course/:courseId/section/:sectionId/lesson')
@UseInterceptors(FileInterceptor('file'))
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get(':id')
  async getOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LessonResponseDto> {
    return await this.lessonService.getOneByIdOrFail(id);
  }

  @Post()
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
  async deleteOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuccessOperationResponseDto> {
    return await this.lessonService.deleteOneByIdOrFail(id);
  }
}

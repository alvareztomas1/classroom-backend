import { Inject, Injectable } from '@nestjs/common';

import { MIME_FILE_TYPE_MAP } from '@common/base/application/constant/file.constant';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CreateLessonDto } from '@lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@lesson/application/dto/update-lesson.dto';
import { LessonDtoMapper } from '@lesson/application/mapper/lesson-dto.mapper';
import {
  ILessonRepository,
  LESSON_REPOSITORY_KEY,
} from '@lesson/application/repository/lesson.repository.interface';
import { Lesson } from '@lesson/domain/lesson.entity';
import { LessonType } from '@lesson/domain/lesson.type';
import { LessonEntity } from '@lesson/infrastructure/database/lesson.entity';

import { FileStorageService } from '@module/cloud/application/service/file-storage.service';

@Injectable()
export class LessonService extends BaseCRUDService<
  Lesson,
  LessonEntity,
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto
> {
  constructor(
    @Inject(LESSON_REPOSITORY_KEY) lessonRepository: ILessonRepository,
    private readonly lessonMapper: LessonDtoMapper,
    private readonly fileStorageService: FileStorageService,
  ) {
    super(lessonRepository, lessonMapper, Lesson.getEntityName());
  }

  private MIME_TYPE_TO_LESSON_TYPE: Record<string, LessonType> = {
    [MIME_FILE_TYPE_MAP.pdf]: LessonType.PDF,
    [MIME_FILE_TYPE_MAP.mp4]: LessonType.VIDEO,
  };

  async saveOne(
    createLessonDto: CreateLessonDto,
    lessonFile?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    const { sectionId, courseId } = createLessonDto;

    if (lessonFile) {
      createLessonDto.url = await this.fileStorageService.uploadFile(
        lessonFile,
        this.buildFileFolder(courseId, sectionId),
      );

      createLessonDto.lessonType =
        this.MIME_TYPE_TO_LESSON_TYPE[lessonFile.mimetype];
    }

    return super.saveOne(createLessonDto);
  }

  async updateOne(
    id: string,
    UpdateLessonDto: UpdateLessonDto,
    lessonFile?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    const { courseId, sectionId } = UpdateLessonDto;

    if (lessonFile) {
      const lesson = await (
        this.repository as ILessonRepository
      ).getOneByIdOrFail(id);

      if (lesson.url) {
        await this.fileStorageService.deleteFile(lesson.url);
      }

      UpdateLessonDto.url = await this.fileStorageService.uploadFile(
        lessonFile,
        this.buildFileFolder(courseId, sectionId),
      );

      UpdateLessonDto.lessonType =
        this.MIME_TYPE_TO_LESSON_TYPE[lessonFile.mimetype];
    }

    return super.updateOneByIdOrFail(id, UpdateLessonDto);
  }

  private buildFileFolder(courseId: string, sectionId: string): string {
    return `${this.fileStorageService.COURSES_FOLDER}/${courseId}/${this.fileStorageService.SECTION_FOLDER}/${sectionId}`;
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import {
  COURSES_FOLDER,
  SECTION_FOLDER,
} from '@module/cloud/application/constants/image-storage-folders.constants';
import { ImageStorageService } from '@module/cloud/application/service/image-storage.service';
import { CreateLessonDto } from '@module/lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@module/lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@module/lesson/application/dto/update-lesson.dto';
import { LessonMapper } from '@module/lesson/application/mapper/lesson.mapper';
import {
  ILessonRepository,
  LESSON_REPOSITORY_KEY,
} from '@module/lesson/application/repository/lesson.repository.interface';
import { Lesson } from '@module/lesson/domain/lesson.entity';

@Injectable()
export class LessonService extends BaseCRUDService<
  Lesson,
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto
> {
  constructor(
    @Inject(LESSON_REPOSITORY_KEY) lessonRepository: ILessonRepository,
    private readonly lessonMapper: LessonMapper,
    private readonly imageStorageService: ImageStorageService,
  ) {
    super(lessonRepository, lessonMapper, Lesson.getEntityName());
  }

  private COURSE_STORAGE_FOLDER = COURSES_FOLDER;
  private SECTION_STORAGE_FOLDER = SECTION_FOLDER;

  async saveOne(
    createLessonDto: CreateLessonDto,
    lessonFile?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    const { sectionId, courseId } = createLessonDto;
    createLessonDto.url = lessonFile
      ? await this.imageStorageService.uploadImage(
          lessonFile,
          this.buildFileFolder(courseId, sectionId),
        )
      : null;

    return super.saveOne(createLessonDto);
  }

  async updateOne(
    id: string,
    UpdateLessonDto: UpdateLessonDto,
    lessonFile?: Express.Multer.File,
  ): Promise<LessonResponseDto> {
    const { courseId, sectionId } = UpdateLessonDto;

    if (lessonFile) {
      UpdateLessonDto.url = await this.imageStorageService.uploadImage(
        lessonFile,
        this.buildFileFolder(courseId, sectionId),
      );
    }

    return super.updateOne(id, UpdateLessonDto);
  }

  private buildFileFolder(courseId: string, sectionId: string): string {
    return `${this.COURSE_STORAGE_FOLDER}/${courseId}/${this.SECTION_STORAGE_FOLDER}/${sectionId}`;
  }
}

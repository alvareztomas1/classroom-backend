import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { SlugService } from '@module/app/application/service/slug.service';
import {
  COURSES_FOLDER,
  IMAGES_FOLDER,
} from '@module/cloud/application/constants/file-storage-folders.constants';
import { FileStorageService } from '@module/cloud/application/service/file-storage.service';
import { CourseResponseDto } from '@module/course/application/dto/course-response.dto';
import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@module/course/application/dto/update-course.dto';
import { CourseMapper } from '@module/course/application/mapper/course.mapper';
import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@module/course/application/repository/repository.interface';
import { Course } from '@module/course/domain/course.entity';

@Injectable()
export class CourseService extends BaseCRUDService<
  Course,
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto
> {
  constructor(
    @Inject(COURSE_REPOSITORY_KEY) repository: ICourseRepository,
    protected readonly mapper: CourseMapper,
    private readonly fileStorageService: FileStorageService,
    private readonly slugService: SlugService,
  ) {
    super(repository, mapper, Course.getEntityName());
  }

  private STORAGE_COURSE_FOLDER = COURSES_FOLDER;
  private STORAGE_IMAGE_FOLDER = IMAGES_FOLDER;

  async saveOne(
    createDto: CreateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    const courseId = uuidv4();
    createDto.id = courseId;
    createDto.imageUrl = image
      ? await this.fileStorageService.uploadFile(
          image,
          this.buildFileFolder(createDto.id),
        )
      : null;

    const baseSlug = this.slugService.buildSlug(createDto.title);
    let uniqueSlug = baseSlug;

    const existingSlugs = await (
      this.repository as ICourseRepository
    ).getSlugsStartingWith(baseSlug);

    if (existingSlugs.includes(baseSlug)) {
      uniqueSlug = this.slugService.buildUniqueSlug(baseSlug, existingSlugs);
    }

    createDto.slug = uniqueSlug;

    return super.saveOne(createDto);
  }

  async updateOne(
    id: string,
    updateDto: UpdateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    if (image) {
      const course = await (
        this.repository as ICourseRepository
      ).getOneByIdOrFail(id);

      await this.fileStorageService.deleteFile(course.imageUrl);
      updateDto.imageUrl = await this.fileStorageService.uploadFile(
        image,
        this.buildFileFolder(id),
      );
    }

    return super.updateOne(id, updateDto);
  }

  private buildFileFolder(courseId: string): string {
    return `${this.STORAGE_COURSE_FOLDER}/${courseId}/${this.STORAGE_IMAGE_FOLDER}`;
  }
}

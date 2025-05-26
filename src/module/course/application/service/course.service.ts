import { Inject, Injectable } from '@nestjs/common';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { COURSES_IMAGES_FOLDER } from '@module/cloud/application/constants/image-storage-folders.constants';
import { ImageStorageService } from '@module/cloud/application/service/image-storage.service';
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
    private readonly imageStorageService: ImageStorageService,
  ) {
    super(repository, mapper, Course.getEntityName());
  }

  async saveOne(
    createDto: CreateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    createDto.imageUrl = image
      ? await this.imageStorageService.uploadImage(image, COURSES_IMAGES_FOLDER)
      : null;
    return super.saveOne(createDto);
  }

  async updateOne(
    id: string,
    updateDto: UpdateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    updateDto.imageUrl = image
      ? await this.imageStorageService.uploadImage(image, COURSES_IMAGES_FOLDER)
      : null;
    return super.updateOne(id, updateDto);
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { SlugService } from '@module/app/application/service/slug.service';
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
      : undefined;

    createDto.slug = createDto.title
      ? await this.buildUniqueSlug(createDto.title)
      : undefined;

    return super.saveOne(createDto);
  }

  async updateOne(
    id: string,
    updateDto: UpdateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    const course = await (
      this.repository as ICourseRepository
    ).getOneByIdOrFail(id);

    if (
      updateDto.status === PublishStatus.published &&
      course.status === PublishStatus.drafted
    ) {
      this.verifyCourseIsComplete(course, updateDto);
    }

    if (image) {
      if (course.imageUrl) {
        await this.fileStorageService.deleteFile(course.imageUrl);
      }

      updateDto.imageUrl = await this.fileStorageService.uploadFile(
        image,
        this.buildFileFolder(id),
      );
    }

    const courseToUpdate = this.mapper.fromUpdateDtoToEntity(course, updateDto);
    const updatedEntity = await this.repository.saveOne(courseToUpdate);
    const responseDto = this.mapper.fromEntityToResponseDto(updatedEntity);

    return responseDto;
  }

  private async buildUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugService.buildSlug(title);
    let uniqueSlug = baseSlug;

    const existingSlugs = await (
      this.repository as ICourseRepository
    ).getSlugsStartingWith(baseSlug);

    if (existingSlugs.includes(baseSlug)) {
      uniqueSlug = this.slugService.buildUniqueSlug(baseSlug, existingSlugs);
    }

    return uniqueSlug;
  }

  private buildFileFolder(courseId: string): string {
    return `${this.fileStorageService.COURSES_FOLDER}/${courseId}/${this.fileStorageService.IMAGES_FOLDER}`;
  }

  private verifyCourseIsComplete(
    course: Course,
    updateDto: UpdateCourseDto,
  ): void {
    const requiredFields: Array<keyof Course> = [
      'title',
      'description',
      'price',
      'imageUrl',
      'difficulty',
    ];

    const missingFields = requiredFields.filter(
      (field) => course[field] == null && updateDto[field] == null,
    );

    if (missingFields.length) {
      throw new BadRequestException(
        `Cannot publish course: missing required fields: ${missingFields.join(', ')}`,
      );
    }
  }
}

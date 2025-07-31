import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import {
  OPERATION_RESPONSE_TYPE,
  SuccessOperationResponseDto,
} from '@common/base/application/dto/success-operation-response.dto';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { SlugService } from '@app/application/service/slug.service';

import { FileStorageService } from '@cloud/application/service/file-storage.service';

import { CourseResponseDto } from '@course/application/dto/course-response.dto';
import { CreateCourseDto } from '@course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@course/application/dto/update-course.dto';
import { CourseDtoMapper } from '@course/application/mapper/course-dto.mapper';
import {
  COURSE_REPOSITORY_KEY,
  ICourseRepository,
} from '@course/application/repository/repository.interface';
import { Course } from '@course/domain/course.entity';
import { CourseEntity } from '@course/infrastructure/database/course.entity';

import {
  CATEGORY_REPOSITORY_KEY,
  ICategoryRepository,
} from '@category/application/repository/category.repository.interface';

@Injectable()
export class CourseService extends BaseCRUDService<
  Course,
  CourseEntity,
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto
> {
  constructor(
    @Inject(COURSE_REPOSITORY_KEY)
    protected readonly repository: ICourseRepository,
    protected readonly mapper: CourseDtoMapper,
    private readonly fileStorageService: FileStorageService,
    private readonly slugService: SlugService,
    @Inject(CATEGORY_REPOSITORY_KEY)
    private readonly categoryRepository: ICategoryRepository,
  ) {
    super(repository, mapper, Course.getEntityName());
  }

  async saveOne(
    createDto: CreateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    createDto.id = uuidv4();
    const { id, title, categoryId } = createDto;
    createDto.imageUrl = image
      ? await this.fileStorageService.uploadFile(
          image,
          this.buildFileFolder(id),
        )
      : undefined;

    createDto.category = categoryId
      ? await this.categoryRepository.getOneByIdOrFail(categoryId)
      : undefined;

    createDto.slug = title ? await this.buildUniqueSlug(title) : undefined;

    return super.saveOne(createDto);
  }

  async updateOne(
    id: string,
    updateDto: UpdateCourseDto,
    image?: Express.Multer.File,
  ): Promise<CourseResponseDto> {
    const { categoryId } = updateDto;
    updateDto.category = categoryId
      ? await this.categoryRepository.getOneByIdOrFail(categoryId)
      : undefined;

    const course = await this.repository.getOneByIdOrFail(id);

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

  async deleteOneByIdOrFail(id: string): Promise<SuccessOperationResponseDto> {
    await this.repository.deleteOneByIdOrFail(id);

    return new SuccessOperationResponseDto(
      `The ${this.entityName} with id ${id} has been deleted successfully`,
      true,
      OPERATION_RESPONSE_TYPE,
    );
  }

  private async buildUniqueSlug(title: string): Promise<string> {
    const baseSlug = this.slugService.buildSlug(title);
    let uniqueSlug = baseSlug;

    const existingSlugs = await this.repository.getSlugsStartingWith(baseSlug);

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
      'category',
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

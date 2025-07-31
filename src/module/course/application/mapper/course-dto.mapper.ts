import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { User } from '@iam/user/domain/user.entity';

import {
  CourseResponseDto,
  CourseResponseInstructor,
} from '@course/application/dto/course-response.dto';
import { CreateCourseDto } from '@course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@course/application/dto/update-course.dto';
import { Course } from '@course/domain/course.entity';

import { Category } from '@category/domain/category.entity';

export class CourseDtoMapper
  implements
    IDtoMapper<Course, CreateCourseDto, UpdateCourseDto, CourseResponseDto>
{
  fromCreateDtoToEntity(dto: CreateCourseDto): Course {
    return new Course(
      dto.instructorId,
      dto.id,
      dto.title,
      dto.description,
      dto.price,
      dto.imageUrl,
      dto.slug,
      dto.difficulty,
      dto.status,
      dto.instructor,
      dto.sections,
      dto.category,
    );
  }

  fromUpdateDtoToEntity(entity: Course, dto: UpdateCourseDto): Course {
    return new Course(
      dto.instructorId ?? entity.instructorId,
      dto.id ?? entity.id,
      dto.title ?? entity.title,
      dto.description ?? entity.description,
      dto.price ?? entity.price,
      dto.imageUrl ?? entity.imageUrl,
      dto.slug ?? entity.slug,
      dto.difficulty ?? entity.difficulty,
      dto.status ?? entity.status,
      dto.instructor ?? entity.instructor,
      dto.sections ?? entity.sections,
      dto.category ?? entity.category,
    );
  }

  fromEntityToResponseDto(entity: Course): CourseResponseDto {
    const instructor = entity.instructor
      ? this.fromInstructorToCourseResponseInstructor(entity.instructor)
      : undefined;

    return new CourseResponseDto(
      Course.getEntityName(),
      entity.instructorId,
      entity.title,
      entity.description,
      entity.price,
      entity.imageUrl,
      entity.status,
      entity.slug,
      entity.difficulty,
      instructor,
      entity.id,
      entity.category ? this.buildCategoryPath(entity.category) : undefined,
    );
  }

  private fromInstructorToCourseResponseInstructor(
    instructor: User,
  ): CourseResponseInstructor {
    return {
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      avatarUrl: instructor.avatarUrl,
    };
  }

  private buildCategoryPath(category: Category): Category {
    const categoryPath = {
      id: category.id,
      name: category.name,
    } as Category;

    if (category.parent) {
      categoryPath.parent = this.buildCategoryPath(category.parent);
    }

    return categoryPath;
  }
}

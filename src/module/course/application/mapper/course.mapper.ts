import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import {
  CourseResponseDto,
  CourseResponseInstructor,
} from '@module/course/application/dto/course-response.dto';
import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@module/course/application/dto/update-course.dto';
import { Course } from '@module/course/domain/course.entity';
import { User } from '@module/iam/user/domain/user.entity';

export class CourseMapper
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
}

import { IDtoMapper } from '@common/base/application/dto/dto.interface';

import { CourseResponseDto } from '@module/course/application/dto/course-response.dto';
import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@module/course/application/dto/update-course.dto';
import { Course } from '@module/course/domain/course.entity';

export class CourseMapper
  implements
    IDtoMapper<Course, CreateCourseDto, UpdateCourseDto, CourseResponseDto>
{
  fromCreateDtoToEntity(dto: CreateCourseDto): Course {
    return new Course(
      dto.id,
      dto.title,
      dto.description,
      dto.price,
      dto.imageUrl,
      dto.status,
      dto.slug,
    );
  }

  fromUpdateDtoToEntity(dto: UpdateCourseDto): Course {
    return new Course(
      dto.id,
      dto.title,
      dto.description,
      dto.price,
      dto.imageUrl,
      dto.status,
      dto.slug,
    );
  }

  fromEntityToResponseDto(entity: Course): CourseResponseDto {
    return new CourseResponseDto(
      Course.getEntityName(),
      entity.title,
      entity.description,
      entity.price,
      entity.imageUrl,
      entity.status,
      entity.slug,
      entity.id,
    );
  }
}

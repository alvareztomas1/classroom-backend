import { default as IEntity } from '@common/base/application/domain/entity.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDto {}

export interface IDtoMapper<
  Entity extends IEntity,
  CreateDto extends IDto,
  UpdateDto extends IDto,
  ResponseDto extends IDto,
> {
  fromEntityToResponseDto(entity: Entity): ResponseDto;
  fromCreateDtoToEntity(dto: CreateDto): Entity;
  fromUpdateDtoToEntity(dto: UpdateDto): Entity;
}

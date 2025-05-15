import IEntity from '@common/base/domain/entity.interface';

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

export interface IResponseDto extends IDto {
  id?: string;
  type: string;
}

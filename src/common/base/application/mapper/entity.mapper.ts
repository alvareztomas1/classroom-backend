import { IEntity } from 'typeorm-fixtures-cli';

import { IDto, IResponseDto } from '@common/base/application/dto/dto.interface';
import { Base } from '@common/base/domain/base.entity';
import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

export interface IEntityMapper<
  Domain extends Base,
  PersistenceEntity extends BaseEntity,
> {
  toDomainEntity(entity: PersistenceEntity): Domain;
  toPersistenceEntity(domain: Domain): PersistenceEntity;
}

export interface IDtoMapper<
  Entity extends IEntity,
  CreateDto extends IDto,
  UpdateDto extends IDto,
  ResponseDto extends IResponseDto,
> {
  fromEntityToResponseDto(entity: Entity): ResponseDto;
  fromCreateDtoToEntity(dto: CreateDto): Entity;
  fromUpdateDtoToEntity(entity: Entity, dto: UpdateDto): Entity;
}

import { BaseResponseDto } from '@common/base/application/dto/base.response.dto';
import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IDto } from '@common/base/application/dto/dto.interface';
import {
  EntityRelations,
  IGetAllOptions,
} from '@common/base/application/dto/query-params/get-all-options.interface';
import {
  OPERATION_RESPONSE_TYPE,
  SuccessOperationResponseDto,
} from '@common/base/application/dto/success-operation-response.dto';
import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';
import { ICRUDService } from '@common/base/application/service/crud-service.interface';
import { Base } from '@common/base/domain/base.entity';
import { BaseEntity } from '@common/base/infrastructure/database/base.entity';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

export class BaseCRUDService<
  DomainEntity extends Base,
  PersistenceEntity extends BaseEntity,
  CreateDto extends IDto,
  UpdateDto extends IDto,
  ResponseDto extends BaseResponseDto,
> implements ICRUDService<DomainEntity, ResponseDto, CreateDto, UpdateDto>
{
  constructor(
    protected readonly repository: BaseRepository<
      DomainEntity,
      PersistenceEntity
    >,
    protected readonly mapper: IDtoMapper<
      DomainEntity,
      CreateDto,
      UpdateDto,
      ResponseDto
    >,
    protected readonly entityName: string,
  ) {}

  async getAll(
    options: Partial<IGetAllOptions<DomainEntity>>,
  ): Promise<CollectionDto<ResponseDto>> {
    const entities = await this.repository.getAll(options);
    const collection = new CollectionDto<ResponseDto>({
      data: entities.data.map((entity) =>
        this.mapper.fromEntityToResponseDto(entity),
      ),
      meta: entities.meta,
    });

    return collection;
  }

  async getOneByIdOrFail(
    id: string,
    include?: EntityRelations<DomainEntity>,
  ): Promise<ResponseDto> {
    const entity = await this.repository.getOneByIdOrFail(id, include);
    const responseDto = this.mapper.fromEntityToResponseDto(entity);

    return responseDto;
  }

  async saveOne(createDto: CreateDto): Promise<ResponseDto> {
    const entity = this.mapper.fromCreateDtoToEntity(createDto);
    const savedEntity = await this.repository.saveOne(entity);
    const responseDto = this.mapper.fromEntityToResponseDto(savedEntity);

    return responseDto;
  }

  async updateOneByIdOrFail(
    id: string,
    updateDto: UpdateDto,
  ): Promise<ResponseDto> {
    const entityToUpdate = await this.repository.getOneByIdOrFail(id);
    const entity = this.mapper.fromUpdateDtoToEntity(entityToUpdate, updateDto);
    const updatedEntity = await this.repository.saveOne(entity);
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
}

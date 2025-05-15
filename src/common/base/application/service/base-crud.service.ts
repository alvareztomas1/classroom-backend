import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IDto, IDtoMapper } from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { ICRUDService } from '@common/base/application/service/crud-service.interface';
import IEntity from '@common/base/domain/entity.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { ResponseSerializerService } from '@module/app/application/service/response-serializer.service';

export class BaseCRUDService<
  Entity extends IEntity,
  CreateDto extends IDto,
  UpdateDto extends IDto,
  ResponseDto extends IDto,
> implements ICRUDService<Entity, ResponseDto, CreateDto, UpdateDto>
{
  constructor(
    protected readonly repository: BaseRepository<Entity>,
    protected readonly mapper: IDtoMapper<
      Entity,
      CreateDto,
      UpdateDto,
      ResponseDto
    >,
    protected readonly responseSerializer: ResponseSerializerService,
    protected readonly entityName: string,
  ) {}

  async getAll(
    options?: IGetAllOptions<Entity>,
  ): Promise<SerializedResponseDtoCollection<ResponseDto>> {
    const entities = await this.repository.getAll(options);
    const collection = new CollectionDto<ResponseDto>({
      data: entities.data.map((entity) =>
        this.mapper.fromEntityToResponseDto(entity),
      ),
      itemCount: entities.itemCount,
      pageCount: entities.pageCount,
      pageNumber: entities.pageNumber,
      pageSize: entities.pageSize,
    });

    return this.responseSerializer.serializeResponseDtoCollection(
      collection.data,
      this.entityName,
      {
        itemCount: collection.itemCount,
        pageCount: collection.pageCount,
        pageNumber: collection.pageNumber,
        pageSize: collection.pageSize,
      },
    );
  }

  async getOneByIdOrFail(
    id: string,
  ): Promise<SerializedResponseDto<ResponseDto>> {
    const entity = await this.repository.getOneByIdOrFail(id);
    const responseDto = this.mapper.fromEntityToResponseDto(entity);

    return this.responseSerializer.serializeResponseDto({
      id,
      responseDto,
      entityName: this.entityName,
      hasDelete: true,
      hasUpdate: true,
    });
  }

  async saveOne(
    createDto: CreateDto,
  ): Promise<SerializedResponseDto<ResponseDto>> {
    const entity = this.mapper.fromCreateDtoToEntity(createDto);
    const savedEntity = await this.repository.saveOne(entity);
    const responseDto = this.mapper.fromEntityToResponseDto(savedEntity);

    return this.responseSerializer.serializeResponseDto({
      id: savedEntity.id,
      responseDto,
      entityName: this.entityName,
      hasDelete: true,
      hasUpdate: true,
    });
  }

  async updateOne(
    id: string,
    updateDto: UpdateDto,
  ): Promise<SerializedResponseDto<ResponseDto>> {
    const entity = this.mapper.fromUpdateDtoToEntity(updateDto);
    const updatedEntity = await this.repository.updateOneByIdOrFail(id, entity);
    const responseDto = this.mapper.fromEntityToResponseDto(updatedEntity);

    return this.responseSerializer.serializeResponseDto({
      id,
      responseDto,
      entityName: this.entityName,
      hasDelete: true,
      hasUpdate: true,
    });
  }

  async deleteOneByIdOrFail(id: string): Promise<void> {
    await this.repository.deleteOneByIdOrFail(id);
  }
}

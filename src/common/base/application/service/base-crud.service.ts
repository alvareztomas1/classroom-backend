import { CollectionDto } from '@common/base/application/dto/collection.dto';
import {
  IDto,
  IDtoMapper,
  IResponseDto,
} from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import {
  OPERATION_RESPONSE_TYPE,
  SuccessOperationResponseDto,
} from '@common/base/application/dto/success-operation-response.dto';
import { ICRUDService } from '@common/base/application/service/crud-service.interface';
import IEntity from '@common/base/domain/entity.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

export class BaseCRUDService<
  Entity extends IEntity,
  CreateDto extends IDto,
  UpdateDto extends IDto,
  ResponseDto extends IResponseDto,
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
    protected readonly entityName: string,
  ) {}

  async getAll(
    options?: IGetAllOptions<Entity>,
  ): Promise<CollectionDto<ResponseDto>> {
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

    return collection;
  }

  async getOneByIdOrFail(id: string, include?: string[]): Promise<ResponseDto> {
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

  async updateOne(id: string, updateDto: UpdateDto): Promise<ResponseDto> {
    const entity = this.mapper.fromUpdateDtoToEntity(updateDto);
    const updatedEntity = await this.repository.updateOneByIdOrFail(id, entity);
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

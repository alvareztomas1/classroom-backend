import { default as IEntity } from '@common/base/application/domain/entity.interface';
import { IDto, IDtoMapper } from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import { ICRUDService } from '@common/base/application/service/crud-service.interface';
import BaseRepository from '@common/base/infrastructure/database/base.repository';

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
  ) {}

  async getAll(options?: IGetAllOptions<Entity>): Promise<ResponseDto[]> {
    const entities = await this.repository.getAll(options);
    const responseDtos = entities.data.map((entity) =>
      this.mapper.fromEntityToResponseDto(entity),
    );

    return responseDtos;
  }

  async getOneByIdOrFail(id: string): Promise<ResponseDto> {
    const entity = await this.repository.getOneByIdOrFail(id);
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

  async deleteOneByIdOrFail(id: string): Promise<void> {
    await this.repository.deleteOneByIdOrFail(id);
  }
}

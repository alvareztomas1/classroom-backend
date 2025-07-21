import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IDto, IResponseDto } from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/query-params/get-all-options.interface';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import IEntity from '@common/base/domain/entity.interface';

export interface ICRUDService<
  Entity extends IEntity,
  ResponseDto extends IResponseDto,
  CreateDto extends IDto,
  UpdateDto extends IDto,
> {
  getAll(options?: IGetAllOptions<Entity>): Promise<CollectionDto<ResponseDto>>;
  getOneByIdOrFail(id: string): Promise<ResponseDto>;
  saveOne(createDto: CreateDto): Promise<ResponseDto>;
  updateOneByIdOrFail(id: string, updateDto: UpdateDto): Promise<ResponseDto>;
  deleteOneByIdOrFail(id: string): Promise<SuccessOperationResponseDto>;
}

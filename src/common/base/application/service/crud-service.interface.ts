import { IDto } from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import IEntity from '@common/base/domain/entity.interface';

export interface ICRUDService<
  Entity extends IEntity,
  ResponseDto extends IDto,
  CreateDto extends IDto,
  UpdateDto extends IDto,
> {
  getAll(
    options?: IGetAllOptions<Entity>,
  ): Promise<SerializedResponseDtoCollection<ResponseDto>>;
  getOneByIdOrFail(id: string): Promise<SerializedResponseDto<ResponseDto>>;
  saveOne(createDto: CreateDto): Promise<SerializedResponseDto<ResponseDto>>;
  updateOne(
    id: string,
    updateDto: UpdateDto,
  ): Promise<SerializedResponseDto<ResponseDto>>;
  deleteOneByIdOrFail(id: string): Promise<void>;
}

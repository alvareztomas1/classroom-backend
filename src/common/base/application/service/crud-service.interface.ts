import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { IDto } from '@common/base/application/dto/dto.interface';
import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import IEntity from '@common/base/domain/entity.interface';

export interface ICRUDService<
  Entity extends IEntity,
  ResponseDto extends IDto,
  CreateDto extends IDto,
  UpdateDto extends IDto,
> {
  getAll(options?: IGetAllOptions<Entity>): Promise<CollectionDto<ResponseDto>>;
  getOneByIdOrFail(id: string): Promise<ResponseDto>;
  saveOne(createDto: CreateDto): Promise<ResponseDto>;
  updateOne(id: string, updateDto: UpdateDto): Promise<ResponseDto>;
  deleteOneByIdOrFail(id: string): Promise<void>;
}

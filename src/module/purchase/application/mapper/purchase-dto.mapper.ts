import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { CreatePurchaseDto } from '@module/purchase/application/dto/create-purchase.dto';
import { PurchaseResponseDto } from '@module/purchase/application/dto/purchase-response.dto';
import { UpdatePurchaseDto } from '@module/purchase/application/dto/update-purchase.dto';
import { Purchase } from '@module/purchase/domain/purchase.entity';

export class PurchaseDtoMapper
  implements
    IDtoMapper<
      Purchase,
      CreatePurchaseDto,
      UpdatePurchaseDto,
      PurchaseResponseDto
    >
{
  fromCreateDtoToEntity(dto: CreatePurchaseDto): Purchase {
    const {
      userId,
      courseId,
      amount,
      status,
      externalId,
      id,
      createdAt,
      deletedAt,
      updatedAt,
    } = dto;

    return new Purchase(
      userId,
      courseId,
      amount as number,
      status,
      externalId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  fromUpdateDtoToEntity(entity: Purchase, dto: UpdatePurchaseDto): Purchase {
    const {
      userId,
      courseId,
      amount,
      externalId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    } = entity;

    return new Purchase(
      userId,
      courseId,
      amount,
      dto.status,
      dto.externalId ?? externalId,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  fromEntityToResponseDto(entity: Purchase): PurchaseResponseDto {
    const {
      userId,
      courseId,
      amount,
      status,
      externalId,
      id,
      createdAt,
      updatedAt,
    } = entity;

    return new PurchaseResponseDto(
      Purchase.getEntityName(),
      userId,
      courseId,
      amount,
      status,
      externalId,
      id,
      createdAt,
      updatedAt,
    );
  }
}

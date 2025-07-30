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
      paymentTransactionId,
      refundTransactionId,
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
      paymentTransactionId,
      refundTransactionId,
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
      paymentTransactionId,
      refundTransactionId,
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
      dto.paymentTransactionId ?? paymentTransactionId,
      dto.refundTransactionId ?? refundTransactionId,
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
      paymentTransactionId,
      refundTransactionId,
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
      paymentTransactionId,
      refundTransactionId,
      id,
      createdAt,
      updatedAt,
    );
  }
}

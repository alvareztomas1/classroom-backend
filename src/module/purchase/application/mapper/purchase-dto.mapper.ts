import { Injectable } from '@nestjs/common';

import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { PaymentMethod } from '@payment-method/domain/payment-method.entity';

import { CreatePurchaseDto } from '@purchase/application/dto/create-purchase.dto';
import {
  PaymentMethodPurchaseResponseDto,
  PurchaseResponseDto,
} from '@purchase/application/dto/purchase-response.dto';
import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';
import { Purchase } from '@purchase/domain/purchase.entity';

@Injectable()
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod,
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod,
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
      status,
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod,
      id,
      createdAt,
      updatedAt,
      deletedAt,
    } = entity;

    return new Purchase(
      userId,
      courseId,
      amount,
      dto.status ?? status,
      dto.paymentMethodId ?? paymentMethodId,
      dto.paymentTransactionId ?? paymentTransactionId,
      dto.refundTransactionId ?? refundTransactionId,
      paymentMethod,
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod,
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
      paymentMethodId,
      paymentTransactionId,
      refundTransactionId,
      paymentMethod
        ? this.buildPaymentMethodPurchaseDto(paymentMethod)
        : undefined,
      id,
      createdAt,
      updatedAt,
    );
  }

  private buildPaymentMethodPurchaseDto(
    paymentMethod: PaymentMethod,
  ): PaymentMethodPurchaseResponseDto {
    return {
      id: paymentMethod.id,
      name: paymentMethod.name,
    };
  }
}

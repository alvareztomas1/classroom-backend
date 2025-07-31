import { fromStringToKebabCase } from '@common/base/application/mapper/base.mapper';
import { IDtoMapper } from '@common/base/application/mapper/entity.mapper';

import { CreatePaymentMethodDto } from '@payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@payment-method/application/dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from '@payment-method/application/dto/update-payment-method.dto';
import { PaymentMethod } from '@payment-method/domain/payment-method.entity';

export class PaymentMethodDtoMapper
  implements
    IDtoMapper<
      PaymentMethod,
      CreatePaymentMethodDto,
      UpdatePaymentMethodDto,
      PaymentMethodResponseDto
    >
{
  fromCreateDtoToEntity(dto: CreatePaymentMethodDto): PaymentMethod {
    const { id, name } = dto;

    return new PaymentMethod(name, id);
  }

  fromEntityToResponseDto(entity: PaymentMethod): PaymentMethodResponseDto {
    const { name, id } = entity;

    return new PaymentMethodResponseDto(
      fromStringToKebabCase(PaymentMethod.name),
      name,
      id,
    );
  }

  fromUpdateDtoToEntity(
    entity: PaymentMethod,
    dto: UpdatePaymentMethodDto,
  ): PaymentMethod {
    return new PaymentMethod(dto.name ?? entity.name, dto.id ?? entity.id);
  }
}

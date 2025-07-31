import { Inject, Injectable } from '@nestjs/common';

import { fromStringToSeparatedWords } from '@common/base/application/mapper/base.mapper';
import { BaseCRUDService } from '@common/base/application/service/base-crud.service';

import { CreatePaymentMethodDto } from '@payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@payment-method/application/dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from '@payment-method/application/dto/update-payment-method.dto';
import { PaymentMethodDtoMapper } from '@payment-method/application/mapper/payment-method-dto.mapper';
import {
  IPaymentMethodRepository,
  PAYMENT_METHOD_REPOSITORY_KEY,
} from '@payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethod } from '@payment-method/domain/payment-method.entity';
import { PaymentMethodEntity } from '@payment-method/infrastructure/database/payment-method.entity';

@Injectable()
export class PaymentMethodCRUDService extends BaseCRUDService<
  PaymentMethod,
  PaymentMethodEntity,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodResponseDto
> {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY_KEY)
    private readonly paymentMethodRepository: IPaymentMethodRepository,
    private readonly paymentMethodMapper: PaymentMethodDtoMapper,
  ) {
    super(
      paymentMethodRepository,
      paymentMethodMapper,
      fromStringToSeparatedWords(PaymentMethod.name),
    );
  }
}

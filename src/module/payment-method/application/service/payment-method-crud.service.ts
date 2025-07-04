import { Inject, Injectable } from '@nestjs/common';

import { BaseCRUDService } from '@common/base/application/service/base-crud.service';
import { StringTransformer } from '@common/transformers/string.transformer';

import { CreatePaymentMethodDto } from '@module/payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@module/payment-method/application/dto/payment-method-response.dto';
import { UpdatePaymentMethodDto } from '@module/payment-method/application/dto/update-payment-method.dto';
import { PaymentMethodMapper } from '@module/payment-method/application/mapper/payment-method.mapper';
import {
  IPaymentMethodRepository,
  PAYMENT_METHOD_REPOSITORY_KEY,
} from '@module/payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

@Injectable()
export class PaymentMethodCRUDService extends BaseCRUDService<
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethodResponseDto
> {
  constructor(
    @Inject(PAYMENT_METHOD_REPOSITORY_KEY)
    private readonly paymentMethodRepository: IPaymentMethodRepository,
    private readonly paymentMethodMapper: PaymentMethodMapper,
  ) {
    super(
      paymentMethodRepository,
      paymentMethodMapper,
      StringTransformer.toSeparatedWords(PaymentMethod.name),
    );
  }
}

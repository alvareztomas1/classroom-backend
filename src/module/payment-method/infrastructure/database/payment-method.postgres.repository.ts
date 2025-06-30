import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityAlreadyExistsException from '@common/base/infrastructure/exception/entity-already-excists.exception';

import { IPaymentMethodRepository } from '@module/payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';
import { PaymentMethodSchema } from '@module/payment-method/infrastructure/database/payment-method.schema';

@Injectable()
export class PaymentMethodPostgresRepository
  extends BaseRepository<PaymentMethod>
  implements IPaymentMethodRepository
{
  constructor(
    @InjectRepository(PaymentMethodSchema)
    protected readonly repository: Repository<PaymentMethod>,
  ) {
    super(repository);
  }

  async findByName(name: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.repository.findOne({
      where: { name },
    });

    return paymentMethod;
  }

  async saveOne(entity: PaymentMethod): Promise<PaymentMethod> {
    const { name } = entity;
    const paymentMethod = await this.findByName(name);

    if (paymentMethod) {
      throw new EntityAlreadyExistsException('name', name);
    }

    return this.repository.save(entity);
  }
}

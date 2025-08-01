import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { titleCase } from 'change-case-all';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';
import EntityAlreadyExistsException from '@common/base/infrastructure/exception/entity-already-excists.exception';

import { PaymentMethodMapper } from '@payment-method/application/mapper/payment-method.mapper';
import { IPaymentMethodRepository } from '@payment-method/application/repository/payment-method-repository.interface';
import { PaymentMethod } from '@payment-method/domain/payment-method.entity';
import { PaymentMethodEntity } from '@payment-method/infrastructure/database/payment-method.entity';

@Injectable()
export class PaymentMethodPostgresRepository
  extends BaseRepository<PaymentMethod, PaymentMethodEntity>
  implements IPaymentMethodRepository
{
  constructor(
    @InjectRepository(PaymentMethodEntity)
    protected readonly repository: Repository<PaymentMethodEntity>,
    private readonly paymentMethodMapper: PaymentMethodMapper,
  ) {
    super(
      repository,
      paymentMethodMapper,
      titleCase(PaymentMethodEntity.name.replace('Entity', '')),
    );
  }

  async saveOne(entity: PaymentMethod): Promise<PaymentMethod> {
    const { name } = entity;
    const paymentMethod = await this.findEntityByName(name);

    if (paymentMethod) {
      throw new EntityAlreadyExistsException('name', name, this.entityType);
    }

    return this.repository.save(entity);
  }

  private async findEntityByName(
    name: string,
  ): Promise<PaymentMethodEntity | null> {
    const paymentMethod = await this.repository.findOne({
      where: { name },
    });

    return paymentMethod;
  }
}

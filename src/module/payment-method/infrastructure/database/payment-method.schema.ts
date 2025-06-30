import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { PaymentMethod } from '@module/payment-method/domain/payment-method.entity';

export const PaymentMethodSchema = new EntitySchema<PaymentMethod>({
  name: PaymentMethod.name,
  target: PaymentMethod,
  tableName: 'payment_method',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
      length: 20,
      unique: true,
    },
  }),
});

import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';
import { ArrayTransformer } from '@common/transformers/array.transformer';

import { User } from '@module/iam/user/domain/user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'user',
  columns: withBaseSchemaColumns({
    email: {
      type: String,
      unique: true,
    },
    externalId: {
      type: String,
      unique: true,
      nullable: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    roles: {
      type: String,
      transformer: new ArrayTransformer(),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      nullable: true,
    },
  }),
});

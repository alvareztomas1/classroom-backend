import { CustomDecorator, SetMetadata, Type } from '@nestjs/common';

import { IPolicyHandler } from '@module/iam/authorization/infrastructure/policy/handler/policy-handler.interface';

export const POLICIES_KEY = 'POLICIES_KEY';

export const Policies = (
  ...handlers: Type<IPolicyHandler>[]
): CustomDecorator<string> => SetMetadata(POLICIES_KEY, handlers);

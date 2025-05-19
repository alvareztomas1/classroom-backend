import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/dto/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { User } from '@module/iam/user/domain/user.entity';

type UserFields = IGetAllOptions<User>['fields'];

export class UserFieldsQueryParamsDto {
  @IsIn(
    [
      'firstName',
      'lastName',
      'email',
      'externalId',
      'avatarUrl',
      'id',
      'role',
      'isVerified',
      'createdAt',
      'updatedAt',
    ] as UserFields,
    {
      each: true,
    },
  )
  @Transform((params) => {
    return fromCommaSeparatedToArray(params.value as string);
  })
  @IsOptional()
  target?: UserFields;
}

import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from '@module/iam/user/application/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

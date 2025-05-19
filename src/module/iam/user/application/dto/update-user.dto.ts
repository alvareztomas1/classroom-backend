import { PartialType } from '@nestjs/mapped-types';

import { UserDto } from '@module/iam/user/application/dto/user.dto';

export class UpdateUserDto extends PartialType(UserDto) {}

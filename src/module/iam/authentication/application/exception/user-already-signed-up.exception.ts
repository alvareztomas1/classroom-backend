import { BadRequestException } from '@nestjs/common';

export class UserAlreadySignedUp extends BadRequestException {
  constructor(message: string, title: string) {
    super(message, title);
  }
}

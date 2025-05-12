import { NotFoundException } from '@nestjs/common';

export class EmailNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}

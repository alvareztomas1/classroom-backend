import { NotFoundException } from '@nestjs/common';

class EntityNotFoundException extends NotFoundException {
  constructor(key: string, value: string, type?: string) {
    super(`${type || 'Entity'} with ${key} ${value} not found`);
  }
}
export default EntityNotFoundException;

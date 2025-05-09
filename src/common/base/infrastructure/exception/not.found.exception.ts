import { NotFoundException } from '@nestjs/common';

class EntityNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Entity with id ${id} not found`);
  }
}
export default EntityNotFoundException;

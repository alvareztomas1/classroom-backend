import { ConflictException } from '@nestjs/common';

class EntityAlreadyExistsException extends ConflictException {
  constructor(key: string, value: string) {
    super(`Entity with ${key} '${value}' already exists`);
  }
}

export default EntityAlreadyExistsException;

import { ConflictException } from '@nestjs/common';

class EntityAlreadyExistsException extends ConflictException {
  constructor(key: string, value: string, type?: string) {
    super(`${type || 'Entity'} with ${key} '${value}' already exists`);
  }
}

export default EntityAlreadyExistsException;

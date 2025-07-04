import { ConflictException } from '@nestjs/common';

export class CategoryAlreadyExistsException extends ConflictException {
  constructor(categoryName: string, isRoot: boolean, parentName?: string) {
    const message = isRoot
      ? `Root category '${categoryName}' already exists`
      : `Subcategory '${categoryName}' already exists under '${parentName}' category`;
    super(message);
  }
}

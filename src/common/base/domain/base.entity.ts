import IEntity from '@common/base/domain/entity.interface';

export abstract class Base implements IEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  constructor(
    id?: string,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static getEntityName(): string {
    return this.name.toLowerCase();
  }
}

import { BaseEntity } from '@common/base/infrastructure/database/base.entity';

describe('BaseEntity', () => {
  describe('domainClass', () => {
    it('should throw "Not implemented" error when called on base class', () => {
      expect(() => BaseEntity.domainClass).toThrow('Not implemented');
    });
  });
});

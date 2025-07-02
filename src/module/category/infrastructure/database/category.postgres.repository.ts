import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import BaseRepository from '@common/base/infrastructure/database/base.repository';

import { Category } from '@module/category/domain/category.entity';
import { CategorySchema } from '@module/category/infrastructure/database/category.schema';

@Injectable()
export class CategoryPostgresRepository extends BaseRepository<Category> {
  constructor(
    @InjectRepository(CategorySchema)
    private readonly categoryRepository: Repository<Category>,
  ) {
    super(categoryRepository);
  }
}

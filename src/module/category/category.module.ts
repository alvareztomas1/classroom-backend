import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryMapper } from '@module/category/application/mapper/category.mapper';
import { CATEGORY_REPOSITORY_KEY } from '@module/category/application/repository/category.repository.interface';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';
import { CategoryPostgresRepository } from '@module/category/infrastructure/database/category.postgres.repository';
import { CategorySchema } from '@module/category/infrastructure/database/category.schema';
import { CategoryController } from '@module/category/interface/category.controller';

const categoryRepositoryProvider: Provider = {
  provide: CATEGORY_REPOSITORY_KEY,
  useClass: CategoryPostgresRepository,
};

@Module({
  imports: [TypeOrmModule.forFeature([CategorySchema])],
  providers: [CategoryCRUDService, CategoryMapper, categoryRepositoryProvider],
  controllers: [CategoryController],
})
export class CategoryModule {}

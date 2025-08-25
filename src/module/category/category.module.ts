import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

import { CategoryDtoMapper } from '@category/application/mapper/category-dto.mapper';
import { CategoryMapper } from '@category/application/mapper/category.mapper';
import { CreateCategoryPolicyHandler } from '@category/application/policy/create-category-policy.handler';
import { DeleteCategoryPolicyHandler } from '@category/application/policy/delete-category-policy.handler';
import { UpdateCategoryPolicyHandler } from '@category/application/policy/update-category-policy.handler';
import {
  CATEGORY_REPOSITORY_KEY,
  CATEGORY_TREE_REPOSITORY_KEY,
} from '@category/application/repository/category.repository.interface';
import { CategoryCRUDService } from '@category/application/service/category-crud.service';
import { Category } from '@category/domain/category.entity';
import { categoryPermissions } from '@category/domain/category.permission';
import { CategoryEntity } from '@category/infrastructure/database/category.entity';
import { CategoryPostgresRepository } from '@category/infrastructure/database/category.postgres.repository';
import { CategoryController } from '@category/interface/category.controller';

const categoryRepositoryProvider: Provider = {
  provide: CATEGORY_REPOSITORY_KEY,
  useClass: CategoryPostgresRepository,
};

const categoryTreeRepositoryProvider: Provider = {
  provide: CATEGORY_TREE_REPOSITORY_KEY,
  useFactory: (dataSource: DataSource) =>
    dataSource.getTreeRepository(CategoryEntity),
  inject: [DataSource],
};

const policyHandlersProviders = [
  CreateCategoryPolicyHandler,
  UpdateCategoryPolicyHandler,
  DeleteCategoryPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    AuthorizationModule.forFeature(),
  ],
  providers: [
    CategoryCRUDService,
    CategoryDtoMapper,
    CategoryMapper,
    categoryRepositoryProvider,
    ...policyHandlersProviders,
    categoryTreeRepositoryProvider,
  ],
  controllers: [CategoryController],
  exports: [
    categoryRepositoryProvider,
    categoryTreeRepositoryProvider,
    CategoryMapper,
  ],
})
export class CategoryModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Category, categoryPermissions);
  }
}

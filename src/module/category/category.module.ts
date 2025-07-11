import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CategoryDtoMapper } from '@module/category/application/mapper/category-dto.mapper';
import { CategoryMapper } from '@module/category/application/mapper/category.mapper';
import { CreateCategoryPolicyHandler } from '@module/category/application/policy/create-category-policy.handler';
import { DeleteCategoryPolicyHandler } from '@module/category/application/policy/delete-category-policy.handler';
import { UpdateCategoryPolicyHandler } from '@module/category/application/policy/update-category-policy.handler';
import {
  CATEGORY_REPOSITORY_KEY,
  CATEGORY_TREE_REPOSITORY_KEY,
} from '@module/category/application/repository/category.repository.interface';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';
import { Category } from '@module/category/domain/category.entity';
import { categoryPermissions } from '@module/category/domain/category.permission';
import { CategoryEntity } from '@module/category/infrastructure/database/category.entity';
import { CategoryPostgresRepository } from '@module/category/infrastructure/database/category.postgres.repository';
import { CategoryController } from '@module/category/interface/category.controller';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

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
})
export class CategoryModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Category, categoryPermissions);
  }
}

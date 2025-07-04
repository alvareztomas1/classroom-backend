import { Module, OnModuleInit, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryMapper } from '@module/category/application/mapper/category.mapper';
import { CreateCategoryPolicyHandler } from '@module/category/application/policy/create-category-policy.handler';
import { DeleteCategoryPolicyHandler } from '@module/category/application/policy/delete-category-policy.handler';
import { UpdateCategoryPolicyHandler } from '@module/category/application/policy/update-category-policy.handler';
import { CATEGORY_REPOSITORY_KEY } from '@module/category/application/repository/category.repository.interface';
import { CategoryCRUDService } from '@module/category/application/service/category-crud.service';
import { Category } from '@module/category/domain/category.entity';
import { categoryPermissions } from '@module/category/domain/category.permission';
import { CategoryPostgresRepository } from '@module/category/infrastructure/database/category.postgres.repository';
import { CategorySchema } from '@module/category/infrastructure/database/category.schema';
import { CategoryController } from '@module/category/interface/category.controller';
import { AuthorizationModule } from '@module/iam/authorization/authorization.module';
import { AppSubjectPermissionStorage } from '@module/iam/authorization/infrastructure/casl/storage/app-subject-permissions-storage';

const categoryRepositoryProvider: Provider = {
  provide: CATEGORY_REPOSITORY_KEY,
  useClass: CategoryPostgresRepository,
};

const policyHandlersProviders = [
  CreateCategoryPolicyHandler,
  UpdateCategoryPolicyHandler,
  DeleteCategoryPolicyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([CategorySchema]),
    AuthorizationModule.forFeature(),
  ],
  providers: [
    CategoryCRUDService,
    CategoryMapper,
    categoryRepositoryProvider,
    ...policyHandlersProviders,
  ],
  controllers: [CategoryController],
})
export class CategoryModule implements OnModuleInit {
  constructor(private readonly registry: AppSubjectPermissionStorage) {}

  onModuleInit(): void {
    this.registry.set(Category, categoryPermissions);
  }
}

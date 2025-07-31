import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { CourseModule } from '@course/course.module';

import { LinkBuilderService } from '@module/app/application/service/link-builder.service';
import { SlugService } from '@module/app/application/service/slug.service';
import { CategoryModule } from '@module/category/category.module';
import { CloudModule } from '@module/cloud/cloud.module';
import { IamModule } from '@module/iam/iam.module';
import { LessonModule } from '@module/lesson/lesson.module';
import { PaymentMethodModule } from '@module/payment-method/payment-method.module';
import { PurchaseModule } from '@module/purchase/purchase.module';
import { SectionModule } from '@module/section/section.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [environmentConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...datasourceOptions,
        autoLoadEntities: true,
      }),
    }),
    CloudModule,
    IamModule,
    CourseModule,
    SectionModule,
    LessonModule,
    PaymentMethodModule,
    CategoryModule,
    PurchaseModule,
  ],
  providers: [LinkBuilderService, SlugService],
  exports: [LinkBuilderService, SlugService],
})
export class AppModule {}

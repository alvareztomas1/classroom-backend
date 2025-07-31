import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { LinkBuilderService } from '@app/application/service/link-builder.service';
import { SlugService } from '@app/application/service/slug.service';

import { CloudModule } from '@cloud/cloud.module';

import { IamModule } from '@iam/iam.module';

import { CourseModule } from '@course/course.module';

import { CategoryModule } from '@category/category.module';

import { LessonModule } from '@lesson/lesson.module';

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

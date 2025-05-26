import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { LinkBuilderService } from '@module/app/application/service/link-builder.service';
import { SlugService } from '@module/app/application/service/slug.service';
import { CloudModule } from '@module/cloud/cloud.module';
import { CourseModule } from '@module/course/course.module';
import { IamModule } from '@module/iam/iam.module';

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
  ],
  providers: [LinkBuilderService, SlugService],
  exports: [LinkBuilderService, SlugService],
})
export class AppModule {}

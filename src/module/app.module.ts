import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { LinkBuilderService } from '@module/app/application/service/link-builder.service';
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
    IamModule,
  ],
  providers: [LinkBuilderService],
  exports: [LinkBuilderService],
})
export class AppModule {}

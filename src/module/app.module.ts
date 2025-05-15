import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { AppService } from '@module/app/application/service/app.service';
import { ResponseSerializerService } from '@module/app/application/service/response-serializer.service';
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
  providers: [ResponseSerializerService, AppService],
  exports: [ResponseSerializerService, AppService],
})
export class AppModule {}

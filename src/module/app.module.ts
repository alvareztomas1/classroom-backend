import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { ResponseSerializerService } from '@module/app/service/response-serializer.service';

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
  ],
  providers: [ResponseSerializerService],
  exports: [ResponseSerializerService],
})
export class AppModule {}

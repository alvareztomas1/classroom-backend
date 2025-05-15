import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { GetCurrentEndpointInterceptor } from '@module/app/application/interceptor/get-current-endpoint.interceptor';
import { AppService } from '@module/app/application/service/app.service';
import { AppExceptionFilter } from '@module/app/infrastructure/nestjs/app-exception.filter';

export const setupApp = (app: NestExpressApplication): void => {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api');

  app.set('query parser', 'extended');

  app.useGlobalInterceptors(
    new GetCurrentEndpointInterceptor(app.get(AppService)),
  );

  app.useGlobalFilters(new AppExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ResponseFormatterInterceptor } from '@module/app/application/interceptor/response-formatter.interceptor';
import { LinkBuilderService } from '@module/app/application/service/link-builder.service';
import { AppExceptionFilter } from '@module/app/infrastructure/nestjs/app-exception.filter';
import { AuthorizationService } from '@module/iam/authorization/application/service/authorization.service';

export const setupApp = (app: NestExpressApplication): void => {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api');

  app.set('query parser', 'extended');

  app.useGlobalInterceptors(
    new ResponseFormatterInterceptor(
      app.get(Reflector),
      app.get(LinkBuilderService),
      app.get(ConfigService),
      app.get(AuthorizationService),
    ),
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

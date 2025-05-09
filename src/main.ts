import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { setupApp } from '@config/app.config';

import { AppModule } from '@module/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

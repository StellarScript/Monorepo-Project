import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import { isProdEnv } from '@appify/utils';
import { AppModule } from './app/app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   const config = app.get(ConfigService);
   const PORT = config.get('config.serverPort');
   const ORIGIN = config.get('config.frontendUrl');

   app.use(cookieParser());
   app.enableCors({
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-TOKEN'],
      origin: ORIGIN,
   });

   app.setGlobalPrefix('api');
   app.useGlobalPipes(new ValidationPipe({ transform: true }));

   await app.listen(PORT);
   Logger.log(`🚀 Application is running on:${ORIGIN}:${PORT}`);
   Logger.log(`${isProdEnv() ? '🚀 Production' : '🚧 Development'} environment`);
}

bootstrap();

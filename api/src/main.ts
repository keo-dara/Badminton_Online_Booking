import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import appConfig from './core/config';

async function bootstrap() {
  console.log(appConfig.database);
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*', // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ],
      credentials: true, // Allow credentials (cookies, authorization headers)
      exposedHeaders: ['Content-Disposition'], // Headers that browsers are allowed to access
      maxAge: 3600, // Cache preflight requests for 1 hour
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  await app.listen(appConfig.port);

  console.log(`Application is running on: ${appConfig.port}`);
}
bootstrap();

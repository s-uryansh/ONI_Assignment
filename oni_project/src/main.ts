import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // cookie parser to read cookie token set on login
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") || 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Redis Socket.IO Adapter for horizontal scaling
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // تفعيل CORS للسماح بالاتصال من واجهة Next.js
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // أنبوب التحقق الشامل
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // فلتر الأخطاء الشامل
  app.useGlobalFilters(new GlobalExceptionFilter());

  // حماية شاملة ضد تسريب البيانات الحساسة
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // Serve uploaded files statically at /uploads/*
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // بادئة API مع إصدار
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || process.env.API_PORT || 4000;
  await app.listen(port);

  console.warn(`🚀 كار وان API يعمل على: http://localhost:${port}/api/v1`);
}

bootstrap();

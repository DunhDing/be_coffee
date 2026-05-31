import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Configure CORS from environment variable CORS_ORIGIN (comma-separated list)
  const rawOrigins = process.env.CORS_ORIGIN ?? '';
  // strip surrounding quotes (single or double), split and trim, remove trailing slashes
  const allowedOrigins = rawOrigins
    .replace(/^\s*["']?|["']?\s*$/g, '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Debug: print configured origins (helps diagnosing CORS during dev)
  console.log('CORS allowed origins:', allowedOrigins.length ? allowedOrigins : '[any]');

  // Use array-based origin list when configured, otherwise allow all origins in dev
  const originOption = allowedOrigins.length ? allowedOrigins : true;

  console.log('Using CORS origin option:', originOption);

  app.enableCors({
    origin: originOption,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Coffee Management API')
    .setDescription('API hệ thống quản lý chuỗi cửa hàng cà phê')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document)
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();

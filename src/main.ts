import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Configure CORS from environment variable CORS_ORIGIN (comma-separated list)
  const rawOrigins = process.env.CORS_ORIGIN;
  const origins = rawOrigins
    ? rawOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : true;

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

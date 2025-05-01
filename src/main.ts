import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // Get ConfigService instance

  app.setGlobalPrefix('api');
  app.enableCors(); // Allow requests from frontend

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Digital Guestbook API')
    .setDescription('API for managing guests, events, and messages.')
    .setVersion('1.0')
    .addBearerAuth(
      // Add Bearer token input to Swagger UI
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // Name this security scheme
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Serve Swagger UI at /api/docs

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error if extra properties are sent
      transformOptions: {
        enableImplicitConversion: true, // Allow automatic type conversion (e.g., string query params to number)
      },
    }),
  );

  const port = configService.get<number>('PORT', 3000); // Use ConfigService
  await app.listen(port);
  console.log(`Backend application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();

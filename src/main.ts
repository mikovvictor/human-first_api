import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SentryExceptionFilter } from './sentry.filter';
import { httpIntegration } from '@sentry/node'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      httpIntegration(), 
    ],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });

  app.enableCors({

    origin: [
      'https://humans-first.vercel.app',
      'http://localhost:3000',
      'https://humansarefirst.org',
      'https://preview--humans-first.lovable.app',
      'https://lovable.dev/projects/89347184-5342-4275-8513-4ad4bffbb34b',
      'https://89347184-5342-4275-8513-4ad4bffbb34b.lovableproject.com'
    ],
    allowedHeaders: [
      'Content-Type',
     ],
    methods: [
      'GET',
      "HEAD",
      "PUT",
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS'
      ]

  });
  app.useGlobalFilters(new SentryExceptionFilter());
  

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
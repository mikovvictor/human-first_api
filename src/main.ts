import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://humans-first.vercel.app/', 'http://localhost:3000','https://humansarefirst.org'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
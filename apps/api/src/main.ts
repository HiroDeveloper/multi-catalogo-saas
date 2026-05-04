import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppEnvironment } from './common/config/validate-env';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppEnvironment, true>);
  const prisma = app.get(PrismaService);
  const apiPrefix = config.get('API_PREFIX', { infer: true });
  const port = config.get('PORT', { infer: true });
  const frontendUrl = config.get('FRONTEND_URL', { infer: true });

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = [
        frontendUrl,
        'http://localhost:3000',
        'http://lvh.me:3000',
      ];
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith('.trycloudflare.com') ||
        origin.endsWith('.lvh.me:3000')
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  prisma.enableShutdownHooks(app);
  await app.listen(port);
}

void bootstrap();

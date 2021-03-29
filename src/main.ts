import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('NestApplication');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
}

(async (): Promise<void> => {
  await bootstrap();
})().catch((error: Error) => {
  logger.error(`Nest application error: ${error.message}`);
  process.exit(1);
});

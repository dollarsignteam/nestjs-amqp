import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('NestApplication');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

(async (): Promise<void> => {
  await bootstrap();
})().catch((error: Error) => {
  logger.error(`Nest application error: ${error.message}`);
});

import { Logger } from '@dollarsign/logger';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const logger = new Logger({ name: 'NestApplication', displayFilePath: false, displayFunctionName: false });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger });
  const port = process.env.APP_PORT || 3000;
  app.enableShutdownHooks();
  await app.listen(port);
}

(async (): Promise<void> => {
  await bootstrap();
})().catch((error: Error) => {
  logger.error(error);
  process.exit(1);
});

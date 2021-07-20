import { Logger } from '@dollarsign/logger';

/**
 * @returns `Logger` instance
 */
export function getLogger(): Logger {
  return new Logger({
    name: 'AMQPModule',
    displayFilePath: false,
    displayFunctionName: false,
  });
}

import { Logger } from '@dollarsign/logger';

/**
 * @param name - logger name
 * @returns `Logger` instance
 */
export function getLogger(name: string): Logger {
  return new Logger({ name, displayFilePath: false });
}

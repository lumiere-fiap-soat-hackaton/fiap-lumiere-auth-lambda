import { createLogger, LogLevels, registerLogFormatter } from 'bs-logger';
import { CreateLoggerOptions } from 'bs-logger/dist/logger';

export declare type LogLevelName = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const logLevel = (process.env.LOG_LEVEL) as LogLevelName;
const nodeEnv = (process.env.NODE_ENV) as string;

registerLogFormatter('custom', m => `${new Date(m.time).toLocaleString('pt-BR', { timeZone: 'UTC' })} | [${m.context.application}] - ${m.message}`);

/**
 * Creates a logger instance for the application
 * @param applicationName
 */
export const createAppLogger = (applicationName: string) => {

  const loggerOptions: CreateLoggerOptions = {
    context: {
      application: applicationName,
      logLevel: LogLevels[logLevel],
      environment: nodeEnv,
    },
    targets: 'stdout%custom',
  };

  return createLogger(loggerOptions);
};
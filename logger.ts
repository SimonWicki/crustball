import pino from 'pino';

export function createLogger() {
  const level = process.env.LOG_LEVEL || 'info';
  const pretty = process.env.NODE_ENV !== 'production';
  return pino(
    {
      level,
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pretty ? pino.transport({ target: 'pino-pretty' }) : undefined,
  );
}

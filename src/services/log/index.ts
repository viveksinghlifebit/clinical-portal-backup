import { createLogger, format, transports, config } from 'winston';

const consoleTransport = new transports.Console({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.stack || info.message}`)
  )
});

export const log = createLogger({
  levels: config.syslog.levels,
  format: format.combine(format.timestamp(), format.metadata(), format.prettyPrint(), format.errors({ stack: true })),
  transports: [consoleTransport],
  exceptionHandlers: [consoleTransport],
  exitOnError: false
});

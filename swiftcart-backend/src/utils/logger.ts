import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { env } from '../config/env';

// Ensure logs directory exists (non-blocking)
const ensureLogsDirectory = () => {
  try {
    if (!existsSync('logs')) {
      mkdirSync('logs', { recursive: true });
    }
  } catch (error) {
    // Silently fail - we'll use console only
  }
};

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  }),
];

// File transports for production (only if directory can be created)
// Skip in development to avoid any potential blocking issues
if (env.NODE_ENV === 'production') {
  try {
    ensureLogsDirectory();
    // Error log file
    transports.push(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
      })
    );

    // Combined log file
    transports.push(
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true,
      })
    );
  } catch (error) {
    // If file transports fail, just use console
    // Silently continue - console transport is already added
  }
}

// Create logger instance with error handling for file transports
let exceptionHandlers: winston.transport[] = [];
let rejectionHandlers: winston.transport[] = [];

try {
  ensureLogsDirectory();
  // Try to create file handlers, but don't fail if directory doesn't exist
  exceptionHandlers = [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ];
  rejectionHandlers = [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ];
} catch (error) {
  // If file handlers fail, just use console (development mode)
  // Silently continue - console transport is already added
}

// Create logger with error handling to prevent blocking
let logger: winston.Logger;
try {
  logger = winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'swiftcart-api' },
    transports,
    exceptionHandlers: exceptionHandlers.length > 0 ? exceptionHandlers : transports,
    rejectionHandlers: rejectionHandlers.length > 0 ? rejectionHandlers : transports,
    // Suppress winston errors to prevent hanging
    silent: false,
  });

  // Add error handlers to prevent hanging on file write errors
  logger.on('error', (error) => {
    // Suppress winston internal errors to prevent hanging
    console.error('Logger error (non-fatal):', error.message);
  });
} catch (error: any) {
  // Fallback to console-only logger if winston fails
  console.warn('Failed to initialize winston logger, using console only:', error.message);
  logger = winston.createLogger({
    level: 'debug',
    transports: [new winston.transports.Console({ format: consoleFormat })],
  });
}

// Stream for Morgan HTTP logger (if needed in future)
logger.stream = {
  write: (message: string) => {
    try {
      logger.info(message.trim());
    } catch (error) {
      // Fallback to console if logger fails
      console.log(message.trim());
    }
  },
};

export default logger;


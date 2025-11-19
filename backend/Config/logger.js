import winston from "winston";
import "winston-daily-rotate-file";

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);

// Daily rotate transport for errors
const errorTransport = new winston.transports.DailyRotateFile({
  filename: "logs/error-%DATE%.log", // %DATE% replaced daily
  datePattern: "YYYY-MM-DD", // log file pattern
  level: "error", // only error level logs
  zippedArchive: true, // compress old logs
  maxSize: "10m", // max size of each log file
  maxFiles: "15d", // delete logs older than 14 days
});

// Daily rotate transport for all logs
const combinedTransport = new winston.transports.DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "15d",
});

// Logger instance
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [errorTransport, combinedTransport],
});

// Optional: log to console for dev
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console());
}

export default logger;

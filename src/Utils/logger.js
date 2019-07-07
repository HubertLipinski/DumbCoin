/**
 * Configurations of logger.
 */
const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');
const dotenv = require('dotenv').config();

const transport = new (winston.transports.DailyRotateFile)({
    filename: './src/Log/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '21d'
});

const date = new Date();
let timestamp = date.toLocaleString();

const logger = winston.createLogger({
    // levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.printf(info => `${timestamp} [ ${info.level} ] - ${info.message}`),
    ),

    transports: [
        new (winston.transports.Console)({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.colorize( {all: true}),
                winston.format.simple(),
            ),
        }),
        transport,
    ]
});

winston.add(logger);

exports.logger = winston;

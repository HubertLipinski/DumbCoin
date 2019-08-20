/**
 * Configurations of logger.
 */
require('winston-daily-rotate-file');
const winston = require('winston');
const { LOG_LEVEL } = require('../Utils/config');


const transport = new (winston.transports.DailyRotateFile)({
    filename: './src/Log/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '100M',
    maxFiles: '21d'
});

const date = new Date();
const timestampLog = date.toLocaleString();

const customLogger = winston.createLogger({
    // levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.printf(info => `${timestampLog} [ ${info.level} ] - ${info.message}`),
    ),

    transports: [
        new (winston.transports.Console)({
            level: LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'HH:mm:ss',
                    alias: 'customTimestamp',
                }),
                winston.format.printf(info => `[${info.customTimestamp}] [ ${info.level} ] ${info.message}`),
                winston.format.colorize( {all: true}),
            ),
            timestamp: true
        }),
    ]
});

winston.add(customLogger);
module.exports = winston;


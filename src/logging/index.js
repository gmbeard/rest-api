const env = require("../environment");
const { createLogger, format, transports } = require("winston");
const { combine, printf, timestamp } = format;

module.exports.requestLogger = require("./request-logger");

module.exports.createLogger = function() {
    return createLogger({
        level: env("LOG_LEVEL") || "info",
        transports: [
            new transports.Console({
                format: combine(
                    timestamp(),
                    printf(({level, message, timestamp}) => {
                        return `${timestamp} [${level}] ${message}`;
                    })
                )
            })
        ]
    });
}

module.exports = function(logger) {
    if (!logger)
        return (req, res, next) => next();

    return (req, res, next) => {
        logger.info(`${req.method} ${req.originalUrl}`);
        next();
    };
}

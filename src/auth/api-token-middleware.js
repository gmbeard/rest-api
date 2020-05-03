const FAILED_AUTH_RESPONSE_DELAY_MS = 
    process.env.NODE_ENV === "production" ?
        1000 : 0;

const MethodsRequiringAuth = ["POST", "PUT", "DELETE"];

function delayIfNonNonEmptyToken(token, delay, cb) {
    if ((token || "").length)
        setTimeout(() => cb(), delay);
    else
        cb();
}

module.exports = function(db, logger) {
    return async function(req, res, next) {
        const requestRequiresAuth = 
            MethodsRequiringAuth.some(m => m === req.method);
        const apiToken = req.get("X-Token");
        let tokenValid = false;

        try {
            tokenValid = await db.isTokenValid(apiToken);
        }
        catch (e) {
            logger.error(`Couldn't authenticate token: ${e}`);

            // There aren't many options at this stage so it's
            // probably best to inform the caller that we're
            // currently unavailable...
            return res.status(503).end();
        }

        if (requestRequiresAuth && !tokenValid) {
            if (logger)
                logger.warn("Invalid authentication token received");
            // If AuthN has failed for a non-empty token then
            // add a delay to the response. This makes
            // brute-force attempts on tokens slightly
            // more difficult...
            return delayIfNonNonEmptyToken(
                apiToken,
                FAILED_AUTH_RESPONSE_DELAY_MS,
                () => res.status(401).end()
            );
        }

        next();
    };
}

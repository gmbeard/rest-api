const ENV_PREFIX = "REST_API_";

module.exports = function(key) {
    return process.env[`${ENV_PREFIX}${key}`];
}

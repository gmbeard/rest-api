module.exports = function(dbType) {
    dbType = (dbType || "mongo").toLowerCase();
    if (dbType === "mongo")
        return require("./mongo")();
    else if (dbType === "local")
        return require("./in-memory")();
    else
        return Promise.reject(Error(`Unsupported repository type: ${dbType}`));
}

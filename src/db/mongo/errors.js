class NotFoundError extends Error {
    constructor(str) {
        super(str);
        this.name = "NotFoundError";
    }
}

class DbError extends Error {
    constructor(str) {
        super(str);
        this.name = "DbError";
    }
}

module.exports = {
    NotFoundError,
    DbError
};

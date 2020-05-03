function findCorrectField(field, val) {
    if (typeof val !== "object")
        return;

    return Object.keys(val).find(f => f.toLowerCase() === field.toLowerCase());
}

function between(field, a, b) {
    return function(item) {
        field = findCorrectField(field, item);
        return field && item[field] >= a && item[field] <= b;
    };
}

function equals(field, val) {
    return function(item) {
        field = findCorrectField(field, item);
        return field && item[field] == val;
    };
}

function matches(field, val) {
    return equals(field, val);
}

function not(op) {
    return function(item) {
        return !op(item);
    };
}

function filterFromUrlQuery(query) {
    let from, to;
    Object.keys(query).forEach(k => {
        switch (k.toLowerCase()) {
            case "pricefrom":
                from = query[k];
                break;
            case "priceto":
                to = query[k];
                break;
        }
    });

    if (!from || !to)
        return;

    return between("price", from, to);
}

module.exports = {
    between,
    equals,
    matches,
    not,
    filterFromUrlQuery
};

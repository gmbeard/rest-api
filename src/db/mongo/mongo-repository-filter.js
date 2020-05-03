module.exports = {
    filterFromUrlQuery(query) {
        if (!query || !Object.keys(query).length)
            return { };

        const filters = Object.keys(query).reduce((acc, k) => {
            switch (k.toLowerCase()) {
                case "pricefrom":
                    acc.push({ Price: { "$gte": parseFloat(query[k]) } });
                    break;
                case "priceto":
                    acc.push({ Price: { "$lte": parseFloat(query[k]) } });
                    break;
                default:
                    throw new Error(`Invalid filter parameter: ${k}`);
            }

            return acc;
        },
        []);

        if (filters.length > 1)
            return { $and: filters };

        return filters.pop();
    }
};

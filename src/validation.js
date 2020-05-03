const String = { name: "String", validator: val => typeof val === "string" };
const Number = { name: "Number", validator: val => typeof val === "number" };
const Array = {
    name: "Array",
    validator: val => 
        typeof val === "object" &&
        typeof val.push === "function" &&
        typeof val.pop === "function" &&
        typeof val.shift === "function" &&
        typeof val.unshift === "function"
};

module.exports.Product = {
    Name: String,
    Price: Number,
    Category: String,
    Sizes: Array
};

function hasField(name, val) {
    return Object.keys(val).some(k => k === name);
}

function validate(Type, input) {
    Object.keys(Type).forEach(f => {
        if (!hasField(f, input))
            throw new Error(`Missing field: ${f}`);

        if (!Type[f].validator(input[f]))
            throw new Error(`Field ${f} not correct type: ${Type[f].name}`);
    });
}

module.exports.validate = validate;

module.exports.ensureValid = function(Type) {
    return function(req, res, next) {
        try {
            validate(Type, req.body);
        }
        catch (e) {
            return res.status(400).json({ message: e.message });
        }

        next();
    }
}

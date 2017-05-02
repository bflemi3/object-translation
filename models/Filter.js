const _ = require('lodash'),
    BASE_ERROR_MSG = 'Invalid filter object.';

class FilterRule {
    constructor(raw) {
        if(!_.isUndefined(raw.find)) {
            if(_.isUndefined(raw.replace))
                throw new TypeError(`${BASE_ERROR_MSG} The 'find' property must be accompanied by the 'replace' property.`);

            this.find = raw.find;
            this.replace = raw.replace;
            this.method = value => value.replace(new RegExp(this.find), this.replace);
            return;
        }

        if(!_.isUndefined(raw.startIndex) || !_.isUndefined(raw.length)) {
            if(_.isUndefined(raw.replace))
                throw new TypeError(`${BASE_ERROR_MSG} The 'startIndex' property must be accompanied by the 'replace' property.`);

            if(!_.isUndefined(raw.find))
                throw new TypeError(`${BASE_ERROR_MSG} The 'find' property cannot be defined if the 'startIndex' or 'length' properties are defined.`);

            this.startIndex = raw.startIndex || 0;
            this.length = raw.length || 0;
            this.replace = raw.replace;
            this.method = value => value.replace(value.substr(this.startIndex, this.length), this.replace);
            return;
        }

        throw new TypeError`${BASE_ERROR_MSG} 'filter' will allow either 'find' and 'replace' or 'startIndex', 'length' and 'replace' properties.`;
    }

    exec(value) {
        if(!_.isString(value)) return value;
        return this.method(value);
    }
}

module.exports = class Filter {
    constructor(raw) {
        if(!Array.isArray(raw)) raw = [raw];
        this.rules = raw.map(f => new FilterRule(f));
    }

    exec(value) {
        if(_.isBoolean(value)) value = value.toString();
        if(!_.isString(value)) return value;

        for(let rule of this.rules) {
            const newValue = rule.exec(value);
            if(newValue !== value) return newValue;
        }

        return value;
    }
};
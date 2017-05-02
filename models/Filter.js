const _ = require('lodash'),
    BASE_ERROR_MSG = 'Invalid filter object.';

module.exports = class Filter {
    constructor(raw) {
        if(raw.find) {
            if(!raw.replace)
                throw new TypeError(`${BASE_ERROR_MSG} The 'find' property must be accompanied by the 'replace' property.`);

            this.find = raw.find;
            this.method = value => value.replace(this.find, this.replace);
        }

        if(raw.startIndex || raw.length) {
            if(!raw.replace)
                throw new TypeError(`${BASE_ERROR_MSG} The 'startIndex' property must be accompanied by the 'replace' property.`);

            if(raw.find)
                throw new TypeError(`${BASE_ERROR_MSG} The 'find' property cannot be defined if the 'startIndex' or 'length' properties are defined.`);

            this.startIndex = raw.startIndex || 0;
            this.length = raw.length || 0;
            this.method = value => value.replace(value.substr(this.startIndex, this.length), this.replace);
        }

        this.replace = raw.replace;
    }

    exec(value) {
        if(!_.isString(value)) return value;
        return this.method(value);
    }
};
const _ = require('lodash');

class Value {
    constructor(value, isRegex = false) {
        this.value = value;
        this.isRegex = isRegex;
    }
}

module.exports = class Rule {
    constructor(rawRule) {
        if(_.isPlainObject(rawRule)) {
            if(rawRule.source) this.source = rawRule.source;
            if(rawRule.target) this.target = rawRule.target;
        }

        if(_.isString(rawRule))
            this.source = rawRule;

        // if(!this.source)
        //     throw new TypeError(`Unable to construct translation rule. Invalid translation rule. The rule must contain at least a source as a string or a property on an object.`);

        this.targetKey = this.target || this.source;
    }

    getSourceValue(data) {
        if(!this.source) return new Value(data);

        // handle when this.source is dot notation or explicit
        let value = _.get(data, this.source);
        if(!_.isUndefined(value)) return new Value(value);

        // handle regex
        if(!_.isPlainObject(data))
            throw new Error(`Unable to find values for given regex expression '${this.source}'. The source data to match against must be an object.`);

        const regex = new RegExp(this.source);
        value = Object.entries(data)
            .filter(([k, v]) => regex.test(k))
            .map(([k, v]) => ({ [this.target ? k.replace(regex, this.target) : k]: v }));
        return new Value(value, true);
    }

    translate(data) {
        const { value, isRegex } = this.getSourceValue(data);
        return isRegex ? Object.assign({}, ...value) : { [this.targetKey]: value };
    }
};
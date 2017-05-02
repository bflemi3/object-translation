const _ = require('lodash');

class SourceValue {
    constructor(value, isRegex = false) {
        this.value = value;
        this.isRegex = isRegex;
    }
}

module.exports = class Rule {
    constructor(rawRule, childRules) {
        if(_.isPlainObject(rawRule)) {
            if(rawRule.source) this.source = rawRule.source;
            if(rawRule.target) this.target = rawRule.target;
        }

        if(_.isString(rawRule))
            this.source = rawRule;

        if(Array.isArray(childRules))
            this.rules = childRules;

        this.targetKey = Array.isArray(this.target) ? undefined : (this.target || this.source);
    }

    getSourceValue(data) {
        if(!this.source) return new SourceValue(data);

        // handle when this.source is dot notation or explicit
        let value = _.get(data, this.source);
        if(!_.isUndefined(value)) return new SourceValue(value);

        // handle regex
        if(!_.isPlainObject(data))
            throw new Error(`Unable to find values for given regex expression '${this.source}'. The source data to match against must be an object.`);

        const regex = new RegExp(this.source);
        value = Object.entries(data)
            .filter(([k, v]) => regex.test(k))
            .map(([k, v]) => ({ [this.target ? k.replace(regex, this.target) : k]: v }));
        return new SourceValue(value, true);
    }

    translate(data) {
        const { value, isRegex } = this.getSourceValue(data);

        if(Array.isArray(this.rules))
            return _.merge({}, ...this.rules.map(r => r.translate(value)));

        return isRegex ? _.merge({}, ...value) : _.set({}, this.targetKey, value);
    }
};
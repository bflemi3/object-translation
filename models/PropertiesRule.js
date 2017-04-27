const Rule = require('./Rule');

module.exports = class PropertiesRule extends Rule {
    constructor(rawRule, childRules) {
        super(rawRule);

        if(!Array.isArray(childRules) || !childRules.length)
            throw new TypeError(`$Unable to construct translation rule. 'properties' must be an array of translation rules with at least one child translation rule.`);

        this.rules = childRules;
    }

    translate(data) {
        const result = { [this.targetKey]: {} },
            { value, isRegex } = this.getSourceValue(data);

        Object.assign(result[this.targetKey], ...this.rules.map(rule => rule.translate(value)));
        return result;
    }
};
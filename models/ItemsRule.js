const Rule = require('./Rule');

module.exports = class ItemsRule extends Rule {
    constructor(rawRule, childRules) {
        super(rawRule);

        if(!Array.isArray(childRules) || !childRules.length)
            throw new TypeError(`Unable to construct translation rule. 'items' must be an array of translation rules with at least one child translation rule.`);

        this.rules = childRules;
    }

    translate(data) {
        const { value, isRegex } = this.getSourceValue(data);
        if(!Array.isArray(value)) {
            const key = this.source ? 'source' : 'target';
            throw new TypeError(`Unable to translate rule { ${key}: ${this[key]} }. Source data is not an array.`);
        }

        return { [this.targetKey]: value.map(v => Object.assign({}, ...this.rules.map(r => r.translate(v)))) };
    }
};
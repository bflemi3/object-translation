const Rule = require('./models/Rule'),
    PropertiesRule = require('./models/PropertiesRule'),
    ItemsRule = require('./models/ItemsRule');

module.exports = function ruleFactory(rawRule) {
    const BASE_ERROR_MSG = 'Unable to construct translation rule.';

    if(rawRule.properties && rawRule.items)
        throw new TypeError(`${BASE_ERROR_MSG} A translation rule cannot have both 'properties' and 'items' defined.`);

    if(rawRule.properties)
        return new PropertiesRule(rawRule, rawRule.properties.map(p => ruleFactory(p)));

    if(rawRule.items)
        return new ItemsRule(rawRule, rawRule.items.map(i => ruleFactory(i)));

    let childRules;
    if(Array.isArray(rawRule.target))
        childRules = rawRule.target.map(r => ruleFactory(r));

    return new Rule(rawRule, childRules);
};
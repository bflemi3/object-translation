const _ = require('lodash'),
    ruleFactory = require('./ruleFactory');

/**
 * Given a map (a set of translation rules), a target object and the source object, will recursively translate the source data
 * into a target object using the map
 * @param rawRules
 * @param target
 * @param source
 * @returns {Object}
 */
module.exports = function translate(rawRules, source, target = {}) {
    if (_.isUndefined(rawRules)) return source;

    if(!Array.isArray(rawRules) || !rawRules.length)
        throw new TypeError(`Invalid argument. The translation rules provided must be an array of at least on translation rule.`);

    const rules = rawRules.map(r => ruleFactory(r)).map(r => r.translate(source));
    Object.assign(target, ...rules);

    return target;
};

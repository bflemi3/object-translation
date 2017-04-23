const serverData = require('./data/server.json'),
    map = require('./config.json').serverToClient,
    _ = require('lodash');

const result = translate(map, {}, serverData);
console.log(JSON.stringify(result, null, 4));

/**
 * Given the clientServerMap, a client object and the data from the server, will recursively translate the server data
 * into a client object using the mapping
 * @param map
 * @param target
 * @param source
 * @returns {Object}
 */
function translate(map, target, source) {
    if(_.isUndefined(map)) return source;

    if(Array.isArray(map)) {
        for(let item of map)
            translate(item, target, source);

        return target;
    }

    if(_.isPlainObject(map)) {
        const [ sourceKey, targetKey ] = [ map.source, map.target ],
            key = targetKey || sourceKey;

        // handle map.items - items describes the objects of an array
        if(map.items && map.items.length) {
            const sourceItems = getValue(source, sourceKey);
            if(!Array.isArray(sourceItems))
                throw new Error(`Unable to translate node '${key}'. The map translation object is defined with the items property, as a result the data being translated must be an array.`);

            target[key] = [];
            for(let item of sourceItems)
                target[key].push(translate(map.items, {}, item));

            return target;
        }

        // handle map.properties - properties describes the properties of an object
        if(map.properties && map.properties.length) {
            target[key] = translate(map.properties, {}, getValue(source, sourceKey));
            return target;
        }

        if(!map.source)
            throw new Error(`Unable to translate node '${key}'. The map translation object is defined without 'properties', 'items' or 'source' properties. At least one must be defined.`);

        return setValue(source, target, key, sourceKey, targetKey);
    }

    if(_.isString(map))
        return setValue(source, target, map, map);

    return target;
}

/**
 * Given a key and data, tries to get the value(s) of the matching key
 * @param data
 * @param key {String} - Can be a regular expression, dot notation or key name
 * @param portion {String} Given a portion string, will return the portion of the matching key. See String.prototype.replace
 * (second argument) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 * @returns {*}
 */
function getValue(data, key, portion) {
    if(_.isUndefined(data)) throw new TypeError(`Invalid argument. 'data' is undefined`);

    if(!key) return data;

    let value = _.get(data, key);
    if(!_.isUndefined(value)) return value;

    // finally key could be regex, try to get values for matching keys
    if(!_.isPlainObject(data))
        throw new Error(`Unable to find values for given regex expression '${key}'. The data to match against must be an object.`);

    value = [];
    const regex = new RegExp(key);
    for(let [k, v] of Object.entries(data)) {
        if(!regex.test(k)) continue;

        if(!portion) {
            value.push([k, v]);
            continue;
        }

        value.push([k, v, k.replace(regex, portion)]);
    }

    return value;
}

function setValue(source, target, key, sourceKey, targetKey) {
    const values = getValue(source, sourceKey, targetKey);
    if(!Array.isArray(values)) {
        target[key] = values;
        return target;
    }

    for(let [k, value, newTargetKey] of values) {
        if(newTargetKey) {
            target[newTargetKey] = value;
            continue;
        }
        target[k] = value;
    }
    return target;
}

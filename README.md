# An ES6 node module to translate a source object into a target object

## Installation

`npm install object-translation`

## How To Use

A simple translation example...

Given the following source object:
```javascript
const source = {
    name: 'Steve',
    age: 35,
    hair_color: 'brown',
    hair_length: 'short',
    height: `6'1"`,
    weight: 170    
};
```
Translate the source into: 
```javascript
{
    name: 'Steve',
    age: 35,
    hair: { color: 'brown', length: 'short' },
    stats: { height: `6'1"`, weight: 170 }
}
```

By creating the following set of translation rules:
```javascript
const translate = require('object-translation'),
    rules = [
        'name',
        'age',
        {
            target: 'hair',
            properties: ['hair_.*']        
        },
        {
            target: 'stats',
            properties: ['height', 'weight']
        }
    ];

console.log(JSON.stringify(translate(source, rules));
```

## Rules
Translation rules dictate how the source is translated into the target. A rule can be as simple as a string defining the [source](#source) key(s) or an object describing a more complex rule.

### source<a name="source"></a>
`source` describes the key, or set of keys to match for this particular rule. `source` can be in the following formats:
* {String} The name of the key to match from the source object
* {String} A regex expression that will match one or more keys from the source object
* {String} A dot notation expression (ie: 'pageInfo.count' ) that will be used to do a deep match on one key from the source object

If `source` is given by itself in the translation rule, the names of the matching keys will also be the names of target keys.
If the translation rule only contains a `source` property, then rule can just be a string that represents the `source`. For example, the following two rules are the same:
```javascript
[
    'hair_.*',
    { source: 'hair_.*' }
]
```

### target<a name="target"></a>
`target` describes the key, or set of keys to be created in the target object. `target` can be in the following formats:
* {String} The name of the key to create
* {String} A replacement pattern as described in [String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter) for the second argument `newSubStr`

If the `target` is not found in the translation rule, the [source](#source) property will be used.

### properties<a name="properties"></a>
`properties` defines the child properties for the target object defined in the rule. `properties` can be in the following formats:
* {Array<Rules>} A collection of translation rules that describe the child properties for the current translation rule.

### items<a name="items"></a>
`items` is a collection of translation rules that defines the current target object to be an array of the target object defined by its rules.  

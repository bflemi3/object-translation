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
```json
{
    "name": "Steve",
    "age": 35,
    "hair": { "color": "brown", "length": "short" },
    "stats": { "height": "6'1\"", "weight": "170lbs" }
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
            properties: [{ source: 'hair_(.*)', target: '$1' }]        
        },
        {
            target: 'stats',
            properties: [
                'height',
                {
                    source: 'weight',
                    filter: { find: '.*', replace: '$&lbs' }
                }
            ]
        }
    ];

console.log(JSON.stringify(translate(source, rules)));
```

Lets walk through the collection of translation rules above...

Rule:
```javascript
'name',
'age'
```
Translation: 
```javascript
{ name: 'Steve', age: 35 } --> { name: 'Steve', age: 35 }
```
This is as basic as it gets. The first rule describes a single property, `name`, at the root of the source object and will create a property called `name` at the root of the target object. This rule could also be written as `{ source: 'name' }` or `{ source: 'name', target: 'name' }`. 

The next rule, `age`, would do the same thing.

Rule:
```javascript
{
    target: 'hair',
    properties: [{ source: 'hair_(.*)', target: '$1' }]
}
```
Translation: 
```javascript
{ hair_color: 'brown', hair_length: 'short' } --> { hair: { color: 'brown', length: 'short' } }
```
This is a more complex rule that defines a new property called `hair` at the root of the target object. `hair` will be an object since it's defined with the [properties](#properties) property. The [properties](#properties) property is a collection of more rules that are used to create the child properties of `hair`, and since there isn't a `source` defined in this rule, the rules in [properties](#properties) will start matching at the root of the source object. To learn more about properties see the [properties](#properties) section under Rules.

Rule:
```javascript
{ 
    source: 'hair_(.*)', 
    target: '$1' 
}
```
Translation:
```javascript
{ hair_color: 'brown', hair_length: 'short' } --> { color: 'brown', length: 'short' }
```
This lone rule inside of the [properties](#properties) property, will look at the root of the source object for any keys that match the regular expression `hair_(.*)` and use the first matching group of the key (`$1`) as the name of the properties to add to the root of the target object. This rule would match "hair_color" and "hair_length", resulting in the object `{ color: 'brown', length: 'short' }` being assigned to the `hair` property of the target object.

Rule:
```javascript
{
    target: 'stats',
    properties: [
        'height',
        {
            source: 'weight',
            filter: { find: '.*', replace: '$&lbs' }
        }
    ]
}
```
Translation:
```javascript
{ height: `6'1"`, weight: 170 } --> { stats: { height: `6'1"`, weight: '170lbs' } }
```
This complex rule will create an object at the root of the target object called `stats`. The [properties](#properties) property in this rule is a collection of two rules. 

Rule:
```javascript
'height'
```
Translation:
```javascript
{ height: `6'1"` } --> { height: `6'1"` }
```
The first rule, `height`, is a simple translation rule that looks for the property `height` at the root of the source object and creates the property `height` at the root of the target object.

Rule:
```javascript
{
    source: 'weight',
    filter: { find: '.*', replace: '$&lbs' }
}
```
Translation:
```javascript
{ weight: 170 } --> { weight: '170lbs' }
```
The second rule of the [properties](#properties) property looks for a property at the root of the source object called `weight` and creates a property at the root of the target object also called `weight`. This rule also defines a [filter](#filter). Filters can be one filter or an array of filters, and are used to modify the transposed target value of the matching keys. This filter `filter: { find: '.*', replace: '$&lbs' }`, uses the regular expression from the `find` property to match the entire value and replaces it with the matched value and "lbs" appended to the end - `170lbs`. To learn more about filters see the [filter](#filter) section under Rules.

To find more complex examples see the [examples](/bflemi3/object-translation/tree/master/tests) in the tests installed with this module.

## Rules
Translation rules dictate how the source is translated into the target. A rule can be as simple as a string defining the [source](#source) key(s) or an object describing a more complex rule. Rules can be defined with the following properties:

### source<a name="source"></a>
`source` describes the key, or set of keys to match for this particular rule. `source` can be in the following formats:
* {String} The name of the key to match from the source object
* {String} A regular expression that will match one or more keys from the source object
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

### filter<a name="filter"></a>
`filter` defines one more filters that are used to modify value(s) matched in a given rule. For example, this simple filter will remove the 3 extra spaces found in the value being transposed to the target object:
```javascript
filter: { find: '\\s{3}', replace: '' }
```
And later, if you wanted to add the spaces back (ie: mapping data from a client to a database that required spaces at the beginning of it's data):
```javascript
filter: { find: '.&', replace: '$&' }
```

The `find` and `replace` properties of a filter are doing a [String.prototype.replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) under the covers, where `find` is the first argument and `replace` is the second, so any valid values for those arguments can be given.
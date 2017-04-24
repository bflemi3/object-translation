const translate = require('../../'),
	data = require('./data/server.json').serverToClient,
	translations = require('./config.json');

const result = translate(translations, data);
console.log(JSON.stringify(result, null, 4));

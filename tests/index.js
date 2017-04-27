const translate = require('../index.js'),
	data = require('./data/server.json'),
	translations = require('./config.json').serverToClient;

const result = translate(translations, data);
console.log(JSON.stringify(result, null, 4));

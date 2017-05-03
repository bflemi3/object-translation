const translate = require('../index.js'),
	serverData = require('./data/server.json'),
    clientData = require('./data/client.json'),
	translations = require('./config.json');

let result = translate(translations.serverToClient, serverData);
console.log(`Server to client test...\n${JSON.stringify(result, null, 4)}`);

// result = translate(translations.clientToServer, clientData);
// console.log(`Client to server test...\n${JSON.stringify(result, null, 4)}`);
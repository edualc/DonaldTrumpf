'use strict';

/*
 Connection just uses websocket to communicate with the server. After receiving a message it will give it to the bot to handle it properly.
*/

var WS = require('ws');
var Messages = require('./shared/messages/messages');

var Connection = {};

var create = function create(connectionString, bot) {
    var connection = Object.create(Connection);
    connection.bot = bot;
    console.log('connecting to: ' + connectionString);
    connection.ws = new WS('' + connectionString);
    connection.ws.onmessage = function (event) {
        console.log('receiving data', event.data);
        var dataObject = JSON.parse(event.data);
        var incoming = Messages.create(dataObject.type, dataObject.data);
        bot.incomingMessage(incoming, function (response) {
            connection.ws.send(JSON.stringify(response));
        });
    };
};

module.exports = {
    create: create
};
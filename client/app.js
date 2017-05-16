'use strict';

/*
 The app is very basic and just instantiate a bot and lets it communicate with the server instantly.
 Check README on how to start a bot against the server.

 You start the bot directly from the root folder with "node build/client/app.js ws://127.0.0.1:3000". So it connects by default to a server running on localhost on port 3000.
 */

let Connection = require('./connection');
let Bot = require('./bot');

let args = process.argv.slice(2); // you can override your bot name with a second argument like "node build/client/app.js ws://127.0.0.1:3000 myBot1"
let serverConnectionString = args[0];
let botName = args.length >= 2 ? args[1] : "DonaldTrumpf 3000"; //CHALLENGE2017: Set name for your bot

let bot1 = Bot.create(botName);

let conn1 = Connection.create(serverConnectionString, bot1);

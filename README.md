# challenge-client-js
This is a JavaScript client (bot) for the [Jass challenge server](https://github.com/webplatformz/challenge).
This client allows you to easily develop a bot for the Jass challenge.

###Wiki (Server):
https://github.com/webplatformz/challenge/wiki

###JassChallenge2017
If you are an enrolled student in switzerland, you are welcome to participate the **JassChallenge2017** competition in April '17

---------------------- LINK TO OUR REGTISTRATION PAGE ----------------------



## Start hacking

### Overview
This client skeleton has a very simple structure and the code should be easily understood.

To start immediately check fo the comment **CHALLENGE2017**. Here you can implement your logic or see what's important.
```javascript
let botName = args.length >= 2 ? args[1] : "challenge-client-js"; //CHALLENGE2017: Set name for your bot
```

### Structure
Following tree should give you a brief overview. The **HACK** comment indicates you have to do something here :-)

```
challenge-client-js
│
└───build
│   │   .. //generated after "$ npm run compile or $ npm start"
│
└───client //implementation of the bot
│   │   app.js //HACK - entry point of your js code... small changes needed
│   │   bot.js //HACK - here all the message management has to be done. Switch on messages shows whats possible.
│   │   connection.js //Connects to server via websocket and delegates all messages to bot. 
│   │
│   └───logic
│   │   │   brain.js //HACK - here lies the decision-making-code. Lot's that can be done here. For now a random implementation takes place.
│   │
│   └───shared
│       │   .. //This is copied from server and has validation, messages, card etc. included.
│
│   Dockerfile //This you might check when working with docker
│   package.json
│   .. 
```

You can freely change the structure at anytime to suite your concept of a decent bot implementation.

## Installation

You only need NodeJS to run this client and a running server which it can connect to (see README of server). 
If you don't want to install NodeJS on your machine, see: Docker Section


### NodeJS
Installing node.js: 

See http://nodejs.org/download/

**Windows** users need to install windows-build-tools
```sh
$ npm install -g windows-build-tools
```

### Start your own tournament
To test your bot against other bots, such das the random bot, you need to start your own tournament. 

1. checkout, build and start the [**challenge server**](https://github.com/webplatformz/challenge):
```sh
$ npm install
$ npm start
```
2. Browse to http://localhosthost:3000
3. Enter some user name: 

![Alt text](doc/images/chooseUsername.PNG?raw=true "Choose a user name")
4. Enter some tournament name and press **Enter** 

![Alt text](doc/images/createTournament.PNG?raw=true "Choose a user name")

5. Join your bots, they should appear on the next page

Get the client and compile it [**challenge client js**](https://github.com/webplatformz/challenge-client-js):
```sh
$ npm install
$ npm run compile
```

Starting 4 bot to see them on the tournament page pic below:
```sh
$ node build/client/app.js ws://127.0.0.1:3000 Bot_Team_A
$ node build/client/app.js ws://127.0.0.1:3000 Bot_Team_A
$ node build/client/app.js ws://127.0.0.1:3000 Bot_Team_B
$ node build/client/app.js ws://127.0.0.1:3000 Bot_Team_B
```

![Alt text](doc/images/tournamentPage.PNG?raw=true "Choose a user name")


For more information check the package.json 

### Docker Container
If you want to run the client in a docker container you can find a Dockerfile in this repo.
We use the linking mechanismus from docker to let the server be visible as host with name **cs**

Have a running server in docker with:
```sh
docker build . -t challenge_server
docker run --name cs -p 3000:3000 -d challenge_server
```

Build the client and run it with (four of them will again start a game immediately):
```sh
docker build . -t challenge_client # '.' is the directory of the repo
docker run --name bot_js --link cs:cs -d  challenge_client
```


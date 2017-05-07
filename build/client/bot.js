'use strict';

/*
 The Bot is the main object which manages all incoming messages. It also keeps the handcards.

 If reacting to messages need some decent logic, it will ask the "brain" for a decision. Since this is a skeleton, some trivial choices are made here directly.

 */

var Messages = require('./shared/messages/messages');
var MessageType = require('./shared/messages/messageType');
var Brain = require('./logic/brain');
var Card = require('./shared/deck/card');

var Bot = {
    handCards: [],
    incomingMessage: function incomingMessage(message, response) {
        var answer = void 0;
        var data = message.data;
        switch (message.type) {
            case MessageType.REQUEST_PLAYER_NAME.name:
                //CHALLENGE2017: Respond with your BotName
                console.log('MyName: ' + this.alias);
                answer = Messages.create(MessageType.CHOOSE_PLAYER_NAME.name, this.alias);
                break;
            case MessageType.REQUEST_SESSION_CHOICE.name:
                answer = Messages.create(MessageType.CHOOSE_SESSION.name, "JOIN_EXISTING", this.sessionName, "TOURNAMENT", false);
                console.log('session choice answer: ' + answer);
                break;
            case MessageType.DEAL_CARDS.name:
                //CHALLENGE2017: Getting cards from server... just put them to your handcards

                // lehmacl1: reset statistics and counters
                this.brain.resetPlayedCards();

                this.handCards = data.map(function (item) {
                    return Card.create(item.number, item.color);
                });
                break;
            case MessageType.REQUEST_TRUMPF.name:
                //CHALLENGE2017: Ask the brain which gameMode to choose
                var gameMode = this.brain.chooseTrumpf(this.handCards);
                answer = Messages.create(MessageType.CHOOSE_TRUMPF.name, gameMode);
                break;
            case MessageType.REQUEST_CARD.name:
                //CHALLENGE2017: Ask the brain which card to choose
                var card = this.brain.chooseCard(this.handCards, data);
                answer = Messages.create(MessageType.CHOOSE_CARD.name, card);
                break;
            case MessageType.PLAYED_CARDS.name:
                //CHALLENGE2017: This removes a handcard if the last played card on the table was one of yours.
                var lastPlayedCard = data[data.length - 1];

                // lehmacl1: This card was played last, handle statistics and counters
                this.brain.registerCardWasPlayed(lastPlayedCard, data);

                this.handCards = this.handCards.filter(function (card) {
                    return card.number !== lastPlayedCard.number || card.color !== lastPlayedCard.color;
                });
                break;
            case MessageType.REJECT_CARD.name:
                //CHALLENGE2017: When server sends this, you send an invalid card... this should never happen! Server will send "REQUEST_CARD" after this once. Make sure you choose a valid card or your bot will loose the game
                console.log(" ######   SERVER REJECTED CARD   #######");
                var pickedCard = this.brain.chooseCard(this.handCards);
                console.log(data);
                console.log(pickedCard);
                console.log(this.handCards);
                console.log(this.brain.cardsAtTable);
                console.log(this.brain.gameType.mode + " | " + this.brain.gameType.trumpfColor);
                break;
            case MessageType.BROADCAST_GAME_FINISHED.name:
                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_SESSION_JOINED.name:
                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_STICH.name:

                // lehmacl1: keep track of current stich
                this.brain.registerStichCompleted();

                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_TOURNAMENT_STARTED.name:
                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_TOURNAMENT_RANKING_TABLE.name:
                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_TEAMS.name:
                //Do nothing with that :-)
                break;
            case MessageType.BROADCAST_TRUMPF.name:
                this.brain.gameMode(data);
                break;
            case MessageType.BROADCAST_WINNER_TEAM.name:
                //Do nothing with that :-)
                break;
            default:
                console.log("Sorry, i cannot handle this message: " + JSON.parse(message));
        }
        if (answer) {
            response(answer);
        }
    }
};

var create = function create(name, sessionName) {
    var bot = Object.create(Bot);
    bot.alias = name;
    bot.sessionName = sessionName || '';
    bot.brain = Brain.create();
    return bot;
};

module.exports = {
    create: create
};
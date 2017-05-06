'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.create = create;

var _card = require('../deck/card');

var _card2 = _interopRequireDefault(_card);

var _messageType = require('./messageType.js');

var _messageType2 = _interopRequireDefault(_messageType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createRequestPlayerName() {
    return {
        type: _messageType2.default.REQUEST_PLAYER_NAME.name
    };
}

function createChoosePlayerName(playerName) {
    return {
        type: _messageType2.default.CHOOSE_PLAYER_NAME.name,
        data: playerName
    };
}

function createBroadcastTeams(teams) {
    return {
        type: _messageType2.default.BROADCAST_TEAMS.name,
        data: teams
    };
}

function createDealCards(cards) {
    return {
        type: _messageType2.default.DEAL_CARDS.name,
        data: cards
    };
}

function createRequestTrumpf(geschoben) {
    return {
        type: _messageType2.default.REQUEST_TRUMPF.name,
        data: geschoben
    };
}

function createRejectTrumpf(gameType) {
    return {
        type: _messageType2.default.REJECT_TRUMPF.name,
        data: gameType
    };
}

function createChooseTrumpf(gameType) {
    return {
        type: _messageType2.default.CHOOSE_TRUMPF.name,
        data: gameType
    };
}

function createBroadcastTrumpf(gameType) {
    return {
        type: _messageType2.default.BROADCAST_TRUMPF.name,
        data: gameType
    };
}

function createBroadcastStich(winner) {
    return {
        type: _messageType2.default.BROADCAST_STICH.name,
        data: winner
    };
}

function createBroadcastGameFinished(teams) {
    return {
        type: _messageType2.default.BROADCAST_GAME_FINISHED.name,
        data: teams
    };
}

function createBroadcastWinnerTeam(team) {
    return {
        type: _messageType2.default.BROADCAST_WINNER_TEAM.name,
        data: team
    };
}

function createPlayedCards(playedCards) {
    return {
        type: _messageType2.default.PLAYED_CARDS.name,
        data: playedCards
    };
}

function createRequestCard(cards) {
    return {
        type: _messageType2.default.REQUEST_CARD.name,
        data: cards
    };
}

function createChooseCard(card) {
    return {
        type: _messageType2.default.CHOOSE_CARD.name,
        data: _card2.default.create(card.number, card.color)
    };
}

function createRejectCard(card) {
    return {
        type: _messageType2.default.REJECT_CARD.name,
        data: card
    };
}

function createRequestSessionChoice(availableSessions) {
    return {
        type: _messageType2.default.REQUEST_SESSION_CHOICE.name,
        data: availableSessions
    };
}

function createChooseSession(sessionChoice) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        sessionName = _ref.sessionName,
        sessionType = _ref.sessionType,
        asSpectator = _ref.asSpectator,
        chosenTeamIndex = _ref.chosenTeamIndex;

    return {
        type: _messageType2.default.CHOOSE_SESSION.name,
        data: {
            sessionChoice: sessionChoice,
            sessionName: sessionName,
            sessionType: sessionType,
            asSpectator: asSpectator,
            chosenTeamIndex: chosenTeamIndex
        }
    };
}

function createSessionJoined(sessionName, player, playersInSession) {
    return {
        type: _messageType2.default.SESSION_JOINED.name,
        data: {
            sessionName: sessionName,
            player: player,
            playersInSession: playersInSession
        }
    };
}

function createBroadcastSessionJoined(sessionName, player, playersInSession) {
    return {
        type: _messageType2.default.BROADCAST_SESSION_JOINED.name,
        data: {
            sessionName: sessionName,
            player: player,
            playersInSession: playersInSession
        }
    };
}

function createBadMessage(message) {
    return {
        type: _messageType2.default.BAD_MESSAGE.name,
        data: message
    };
}

function createTournamentRankingTable(rankingTable) {
    return {
        type: _messageType2.default.BROADCAST_TOURNAMENT_RANKING_TABLE.name,
        data: rankingTable
    };
}

function createStartTournament() {
    return {
        type: _messageType2.default.START_TOURNAMENT.name
    };
}

function createBroadcastTournamentStarted() {
    return {
        type: _messageType2.default.BROADCAST_TOURNAMENT_STARTED.name
    };
}

function createJoinBot(data) {
    return {
        type: _messageType2.default.JOIN_BOT.name,
        data: data
    };
}

function create(messageType) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
    }

    switch (messageType) {
        case _messageType2.default.REQUEST_PLAYER_NAME.name:
            return createRequestPlayerName();
        case _messageType2.default.CHOOSE_PLAYER_NAME.name:
            return createChoosePlayerName.apply(undefined, data);
        case _messageType2.default.BROADCAST_TEAMS.name:
            return createBroadcastTeams.apply(undefined, data);
        case _messageType2.default.DEAL_CARDS.name:
            return createDealCards.apply(undefined, data);
        case _messageType2.default.REQUEST_TRUMPF.name:
            return createRequestTrumpf.apply(undefined, data);
        case _messageType2.default.REJECT_TRUMPF.name:
            return createRejectTrumpf.apply(undefined, data);
        case _messageType2.default.CHOOSE_TRUMPF.name:
            return createChooseTrumpf.apply(undefined, data);
        case _messageType2.default.BROADCAST_TRUMPF.name:
            return createBroadcastTrumpf.apply(undefined, data);
        case _messageType2.default.BROADCAST_WINNER_TEAM.name:
            return createBroadcastWinnerTeam.apply(undefined, data);
        case _messageType2.default.BROADCAST_STICH.name:
            return createBroadcastStich.apply(undefined, data);
        case _messageType2.default.BROADCAST_GAME_FINISHED.name:
            return createBroadcastGameFinished.apply(undefined, data);
        case _messageType2.default.PLAYED_CARDS.name:
            return createPlayedCards.apply(undefined, data);
        case _messageType2.default.REQUEST_CARD.name:
            return createRequestCard.apply(undefined, data);
        case _messageType2.default.CHOOSE_CARD.name:
            return createChooseCard.apply(undefined, data);
        case _messageType2.default.REJECT_CARD.name:
            return createRejectCard.apply(undefined, data);
        case _messageType2.default.REQUEST_SESSION_CHOICE.name:
            return createRequestSessionChoice.apply(undefined, data);
        case _messageType2.default.CHOOSE_SESSION.name:
            return createChooseSession.apply(undefined, data);
        case _messageType2.default.SESSION_JOINED.name:
            return createSessionJoined.apply(undefined, data);
        case _messageType2.default.BROADCAST_SESSION_JOINED.name:
            return createBroadcastSessionJoined.apply(undefined, data);
        case _messageType2.default.BAD_MESSAGE.name:
            return createBadMessage.apply(undefined, data);
        case _messageType2.default.BROADCAST_TOURNAMENT_RANKING_TABLE.name:
            return createTournamentRankingTable.apply(undefined, data);
        case _messageType2.default.START_TOURNAMENT.name:
            return createStartTournament.apply(undefined, data);
        case _messageType2.default.BROADCAST_TOURNAMENT_STARTED.name:
            return createBroadcastTournamentStarted.apply(undefined, data);
        case _messageType2.default.JOIN_BOT.name:
            return createJoinBot.apply(undefined, data);
        default:
            throw 'Unknown message type ' + messageType;
    }
}

module.exports = {
    create: create
};
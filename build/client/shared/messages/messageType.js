'use strict';

var _sessionChoice = require('../session/sessionChoice.js');

var _sessionChoice2 = _interopRequireDefault(_sessionChoice);

var _gameMode = require('../game/gameMode.js');

var _gameMode2 = _interopRequireDefault(_gameMode);

var _card = require('../deck/card.js');

var _sessionType = require('../session/sessionType.js');

var _sessionType2 = _interopRequireDefault(_sessionType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MessageType = {
    REQUEST_PLAYER_NAME: {
        name: 'REQUEST_PLAYER_NAME'
    },
    CHOOSE_PLAYER_NAME: {
        name: 'CHOOSE_PLAYER_NAME',
        constraints: {
            'type': {
                presence: true
            },
            'data': {
                presence: true,
                length: {
                    minimum: 1
                }
            }
        }
    },
    BROADCAST_TEAMS: {
        name: 'BROADCAST_TEAMS'
    },
    DEAL_CARDS: {
        name: 'DEAL_CARDS'
    },
    REQUEST_TRUMPF: {
        name: 'REQUEST_TRUMPF'
    },
    CHOOSE_TRUMPF: {
        name: 'CHOOSE_TRUMPF',
        constraints: {
            'type': {
                presence: true
            },
            'data.mode': {
                presence: true,
                inclusion: {
                    within: _gameMode2.default
                }
            },
            'data.trumpfColor': {
                inclusion: {
                    within: _card.CardColor
                }
            }
        }
    },
    REJECT_TRUMPF: {
        name: 'REJECT_TRUMPF'
    },
    BROADCAST_TRUMPF: {
        name: 'BROADCAST_TRUMPF'
    },
    BROADCAST_STICH: {
        name: 'BROADCAST_STICH'
    },
    BROADCAST_WINNER_TEAM: {
        name: 'BROADCAST_WINNER_TEAM'
    },
    BROADCAST_GAME_FINISHED: {
        name: 'BROADCAST_GAME_FINISHED'
    },
    PLAYED_CARDS: {
        name: 'PLAYED_CARDS'
    },
    REQUEST_CARD: {
        name: 'REQUEST_CARD'
    },
    CHOOSE_CARD: {
        name: 'CHOOSE_CARD',
        constraints: {
            'type': {
                presence: true
            },
            'data.number': {
                presence: true,
                inclusion: {
                    within: [6, 7, 8, 9, 10, 11, 12, 13, 14]
                }
            },
            'data.color': {
                presence: true,
                inclusion: {
                    within: _card.CardColor
                }
            }
        }
    },
    REJECT_CARD: {
        name: 'REJECT_CARD'
    },
    REQUEST_SESSION_CHOICE: {
        name: 'REQUEST_SESSION_CHOICE'
    },
    CHOOSE_SESSION: {
        name: 'CHOOSE_SESSION',
        constraints: {
            'type': {
                presence: true
            },
            'data.sessionChoice': {
                presence: true,
                inclusion: {
                    within: _sessionChoice2.default
                }
            },
            'data.sessionName': {
                length: {
                    minimum: 1
                }
            },
            'data.sessionType': {
                inclusion: {
                    within: _sessionType2.default
                }
            },
            'data.chosenTeamIndex': {
                inclusion: {
                    within: [0, 1]
                }
            },
            'data.asSpectator': {
                presence: false
            }
        }
    },
    SESSION_JOINED: {
        name: 'SESSION_JOINED'
    },
    BROADCAST_SESSION_JOINED: {
        name: 'BROADCAST_SESSION_JOINED'
    },
    BAD_MESSAGE: {
        name: 'BAD_MESSAGE'
    },
    BROADCAST_TOURNAMENT_RANKING_TABLE: {
        name: 'BROADCAST_TOURNAMENT_RANKING_TABLE'
    },
    START_TOURNAMENT: {
        name: 'START_TOURNAMENT',
        constraints: {
            'type': {
                presence: true
            }
        }
    },
    BROADCAST_TOURNAMENT_STARTED: {
        name: 'BROADCAST_TOURNAMENT_STARTED'
    },
    JOIN_BOT: {
        name: 'JOIN_BOT',
        constraints: {
            'type': {
                presence: true
            },
            'data.sessionName': {
                presence: true
            },
            'data.chosenTeamIndex': {
                inclusion: {
                    within: [0, 1]
                }
            }
        }
    }
};

module.exports = MessageType;
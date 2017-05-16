let Card = require('./../shared/deck/card');

// Farbenreihenfolge
var Colors = [
	'HEARTS',
	'DIAMONDS',
	'CLUBS',
	'SPADES'
];

// initChanceToHaveCard[player][color][number]
// 
// After initialization, all the values are either 1 (this instance has this card),
// 0 (this player does not have this card as player isn't this instance), or 0.333 as
// this is the average chance for the player to have this card.
// 
// IMPORTANT! This bot instance is always index 0
const initChanceToHaveCard = [
	// "this bot" = current player initializes everything with 0 as the cards that this
	// instance has are being set to 1 on initialization.
	[
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// HEARTS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// DIAMONDS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// CLUBS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0]		// SPADES
	],
	// for all the not-this-instance-of-bot players, the values are either 0.333 if this player
	// does not have this card or 0 if this player DOES have this card
	[
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// HEARTS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// DIAMONDS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// CLUBS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333]		// SPADES
	],
	[
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// HEARTS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// DIAMONDS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// CLUBS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333]		// SPADES
	],
	[
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// HEARTS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// DIAMONDS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333],		// CLUBS
		[0,0,0,0,0,0, 0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333,0.333]		// SPADES
	]
];

var ChanceCalc = {
	cardsInGame: [],
	cardsToProcess: [],
	cardsToTrack: [],
	chanceToHaveCard: [],
	gameType: {},
	playerHasColor: [],
	playerId: 0,

	initialize: function (handcards) {
		// Initialize both initial values for the Arrays
		this.cardsInGame = this._initCardsInGame();
		this.playerHasColor = this._initPlayerHasColorArray();
		this.chanceToHaveCard = JSON.parse(JSON.stringify(initChanceToHaveCard));

		for (var i = this.cardsToProcess.length - 1; i >= 0; i--) {
			this.cardsToProcess.pop();
		}

		for (var i = this.cardsToTrack.length - 1; i >= 0; i--) {
			this.cardsToTrack.pop();
		}

		// Set own cards to 1 for self and 0 for other players
		for (var i = handcards.length - 1; i >= 0; i--) {
			this.setHasCard(handcards[i], 0, 1);
		}

		console.log('INITIALIZED!');
		this._printPlayerHasColor();

	},
	setCardInGame: function(card, value) {
		this.cardsInGame[this.mapCardToColorIndex(card)][card.number] = value;
	},
	setChanceToHaveCard: function(card, playerId, value) {
		this.chanceToHaveCard[playerId][this.mapCardToColorIndex(card)][card.number] = value;
	},
	setHasCard: function(card, playerId, value) {
		this.setChanceToHaveCard(card, playerId, value);
		this.setChanceToHaveCard(card, (playerId + 1) % 4, 0);
		this.setChanceToHaveCard(card, (playerId + 2) % 4, 0);
		this.setChanceToHaveCard(card, (playerId + 3) % 4, 0);
	},
	getCardInGame: function(card) {
		return this.cardsInGame[this.mapCardToColorIndex(card)][card.number];
	},
	getChanceToHaveCard: function(card, playerId) {
		return this.chanceToHaveCard[playerId][this.mapCardToColorIndex(card)][card.number];
	},
	mapCardToColorIndex: function(card) {
		return Colors.indexOf(card.color);
	},
	mapColorToColorIndex: function(color) {
		return Colors.indexOf(color);
	},
	// mark player (:playerId) as he has no cards of :color left
	markPlayerHasNoCardsOfColor: function(playerId, color) {
		var colorIndex = this.mapColorToColorIndex(color);
		this.playerHasColor[playerId][colorIndex] = 0;
	},
	// is being called from brain.registerCardWasPlayer()
	// PLAYED_CARDS
	registerCardWasPlayed: function(lastPlayedCard, playedCards) {
		// mark card as played in the current stich
		this.cardsToProcess.push(lastPlayedCard);
		this.setCardInGame(lastPlayedCard, 'x');
	},
	// is being called from brain.registerStichCompleted()
	// BROADCAST_STICH
	registerStichCompleted: function(data) {
		var playedCards = data.playedCards;

		// determine if the currently ending stich was for your
		// team or the opposing team
		var value = -1;
		if (data.name === "DonaldTrumpf 3000") {
			value = 1;
		}

		// loop over all the cards and set the 'x'-marked cards
		// to the correct value (1 or -1) depending on who made the stich
		for (var i = this.cardsInGame.length - 1; i >= 0; i--) {
			for (var j = this.cardsInGame[i].length - 1; j >= 0; j--) {
				if (this.cardsInGame[i][j] === 'x') {
					this.cardsInGame[i][j] = value;
				}
			}
		}
	},
	triggerChanceCalculation: function() {
		// TODO!
		// Handle newly added player-has-no-cards-of-this-color
		for (var i = 0; i < 4; i++) { // color
			for (var j = 0; j < this.playerHasColor.length; j++) { // player
				if (this.playerHasColor[j][i] === 0) {
						this.chanceToHaveCard[j][i] = new Array(15).fill(0);
				}
			}
		}
		

		// recalculate chance calculation based off new probabilities
		for (var i = 0; i < 4; i++) { // color
			for (var k = 6; k < 15; k++) { // card
				// Player does not have the card himself and the card has not been played yet
				if ((this.chanceToHaveCard[0][i][k] === 0) && (this.cardsInGame[i][k] === 0)) {
					let divisor = this.playerHasColor[1][i] + this.playerHasColor[2][i] + this.playerHasColor[3][i];

					for (var j = 1; j < 4; j++) { // player
						this.chanceToHaveCard[j][i][k] = (divisor === 0) ? 0 : (this.playerHasColor[j][i] * 1) / divisor;
					}
				}
			}
		}

		// TODO
		// ======================================
		// If all 9 cards of a color were played, set
		// playerHasColor for all players to 0 for that color


	},
	// is being called from brain.chooseCard()
	// REQUEST_CARD
	update: function(handcards, tableCards, gameType) {
		// handle cardsToProcess
		// (this makes sure, that players get their cards subtracted from the
		// chanceToHaveCard array as cards are being played)
		// ====================================================================
		console.log('cardsToProcess of ChanceCalc: ' + this.cardsToProcess.length + '\n' + JSON.stringify(this.cardsToProcess));
		for (var i = 0; i < this.cardsToProcess.length; i++) {
			// increment by 3 => go back one (in modulo 4), start at last
			this.setHasCard(
				this.cardsToProcess[(this.cardsToProcess.length - 1) - i],
				((this.playerId + (3 * i)) % 4),
				0
			);
		}
		for (var i = this.cardsToProcess.length - 1; i >= 0; i--) {
			this.cardsToProcess.pop();
		}
		
		// handle cardsToTrack
		// (this makes sure, that players that can't play a certain color
		// are being flagged)
		// ====================================================================
		// the player indices ((this.playerId + 3 + (3 * i)) % 4) are because this is being executed
		// during the chooseCard function, which means the last card added was by the player
		// just before us, meaning ID = 3 which is the same as this.playerId(0) + 3 and incrementing
		// by (3 * i) as +3 is the same as -1 in modulo 4
		console.log('cardsToTrack of ChanceCalc: ' + this.cardsToTrack.length + '\n' + JSON.stringify(this.cardsToTrack));
		for (var i = this.cardsToTrack.length - 1; i >= 0; i--) {
			// Trumpf is not being played by player => interesting case, as trumpf 
			// could be played at any time and is no help to determine if player 
			// has no cards of a certain color
			if (this.cardsToTrack[i].card.color !== this.cardsToTrack[i].trumpfColor) {
				// Trumpf was played as leadColor, but player did NOT play a trumpf
				// ==> mark this player, as he has no "this.cardsToTrack[i].trumpfColor" cards left!
				if (this.cardsToTrack[i].leadColor === this.cardsToTrack[i].trumpfColor) {
					this.markPlayerHasNoCardsOfColor(((this.playerId + 3 + (3 * i)) % 4), this.cardsToTrack[i].leadColor);

				// neither leadColor nor the cards color are trumpf. Check if the player
				// played a leadColor card or not.
				} else {
					// Player neither played the leadColor nor a trumpf
					// ==> mark this player, as he has no "this.cardsToTrack[i].color" cards left!
					if (this.cardsToTrack[i].card.color !== this.cardsToTrack[i].leadColor) {
						this.markPlayerHasNoCardsOfColor(((this.playerId + 3 + (3 * i)) % 4), this.cardsToTrack[i].leadColor);
					}
				}
			} 
		}
		
		for (var i = this.cardsToTrack.length - 1; i >= 0; i--) {
			this.cardsToTrack.pop();
		}

		// triggers a new calculation for the chanceToHaveCard array
		this.triggerChanceCalculation();

		this._printCardsInGame();
		this._printChanceToHaveCardArray();
		this._printPlayerHasColor();
	},
	/**
	 * initCardsInGame[color][number]
	 * 'x'	Card was played, but is in the current stich
	 *  1		Card was played, your team got the stich
	 *  0		Card NOT played, can still be played by anyone
	 * -1		Card was played, opposing team got the stich
	 */
	_initCardsInGame: function() {
		var tmp = new Array(4)
		for (var i = 0; i < 4; i++) {
			tmp[i] = new Array(15).fill(0);
		}
		return tmp;
	},
	// Für jeden Spieler Array mit Farben, die er nicht
	// mehr hat (1 = Spieler hat Farbe, 0 = Spieler hat Farbe nicht mehr)
	_initPlayerHasColorArray: function() {
		var tmp = new Array(4)
		for (var i = 0; i < 4; i++) {
			tmp[i] = new Array(4).fill(1);
		}
		return tmp;
	},
	// Prints the content of the chanceToHaveCard Array
	_printChanceToHaveCardArray: function() {
		console.log('\t###### - CHANCE TO HAVE CARD');
		for (var i = 0; i < this.chanceToHaveCard.length; i++) {
			for (var j = 0; j < this.chanceToHaveCard[i].length; j++) {
				console.log('\t' + JSON.stringify(this.chanceToHaveCard[i][j]));
			}
			console.log('');
		}
	},
	// Prints the content of the cardsInGame Array
	_printCardsInGame: function() {
		console.log('\t\##### - CARDS IN GAME');
		for (var i = 0; i < this.cardsInGame.length; i++) {
			console.log('\t' + JSON.stringify(this.cardsInGame[i]));
		}
	},
	// Prints the content of the cardsInGame Array
	_printPlayerHasColor: function() {
		console.log('\t\##### - PLAYER HAS COLOR');
		for (var i = 0; i < this.playerHasColor.length; i++) {
			console.log('\t' + JSON.stringify(this.playerHasColor[i]));
		}
	}
};

var create = function () {
    var chanceCalc = Object.create(ChanceCalc);
    return chanceCalc;
};

module.exports = {
    create
};
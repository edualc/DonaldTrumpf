let Card = require('./../shared/deck/card');

// Farbenreihenfolge
var Colors = [
	'HEARTS',
	'DIAMONDS',
	'CLUBS',
	'SPADES'
];

var ChanceCalc = {
	cardsInGame: [], // cardsInGame[playerId][color][number]
	cardsOfColorPlayed: [], // cardsOfColorPlayer[color]
	chanceToHaveCard: [], // chanceToHaveCard[playerId][color][number]
	gameType: {},
	playerHasColor: [], // playerHasColor[playerId][color]
	playerId: 0,
	stich: [], // stich[stichCount].playedCards[0-3]
	stichCount: 0,

	initialize: function (handcards) {
		// Initialize both initial values for the Arrays
		this.cardsInGame = this._initCardsInGameArray();
		this.playerHasColor = this._initPlayerHasColorArray();
		this.chanceToHaveCard = this._initChanceToHaveCardArray();
		this.stich = this._initStich();
		this.stichCount = 0;

		this.cardsOfColorPlayed = this._initArray(4,0);

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
		this.setChanceToHaveCard(card, (playerId % 4), value);
		for (var i = 1; i < 4; i++) {
			this.setChanceToHaveCard(card, (playerId + i) % 4, 0);
		}
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
	registerCardWasPlayed: function(lastPlayedCard, playedCards, stichCount) {
		// mark card as played in the current stich
		this.setCardInGame(lastPlayedCard, 'x');

		// set leadColor for a stich
		this.stich[stichCount].playedCards.push(lastPlayedCard);
		if (this.stich[stichCount].playedCards.length === 1) {
			this.stich[stichCount].leadColor = lastPlayedCard.color;	
		}

		// increment the cards of color played counter
		this.cardsOfColorPlayed[this.mapCardToColorIndex(lastPlayedCard)] += 1;
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

		this.stichCount += 1;

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
		// adjust arrays before recalculating
		this._adjustChanceToHaveCardAccordingToPlayerHasColorChanges();
		this._setPlayerHasColorToZeroWhenAllCardsOfColorArePlayed();
		this._adjustPlayerHasColorAccordingToChanceToHaveCardChanges();

		// recalculate
		this._recalculateChanceToHaveCard();
	},
	// is being called from brain.chooseCard()
	// REQUEST_CARD
	update: function(handcards, tableCards, gameType) {
		this._setPlayerPosForCurrentStich();
		this._trackNewlyPlayedCards(gameType);

		// triggers a new calculation for the chanceToHaveCard array
		this.triggerChanceCalculation();

		// this._printCardsInGame();
		// this._printChanceToHaveCardArray();
		// this._printPlayerHasColor();
		// this._printStich();
	},
	/**
	 * initCardsInGame[color][number]
	 * 'x'	Card was played, but is in the current stich
	 *  1		Card was played, your team got the stich
	 *  0		Card NOT played, can still be played by anyone
	 * -1		Card was played, opposing team got the stich
	 */
	_initCardsInGameArray: function() {
		var tmp = new Array(4)
		for (var i = 0; i < 4; i++) {
			tmp[i] = this._initArray(15,0);
		}
		return tmp;
	},
	// Für jeden Spieler Array mit Farben, die er nicht
	// mehr hat (1 = Spieler hat Farbe, 0 = Spieler hat Farbe nicht mehr)
	_initPlayerHasColorArray: function() {
		var tmp = new Array(4)
		for (var i = 0; i < 4; i++) {
			tmp[i] = this._initArray(4,1);
		}
		return tmp;
	},
	// initChanceToHaveCard[player][color][number]
	// 
	// After initialization, all the values are either 1 (this instance has this card),
	// 0 (this player does not have this card as player isn't this instance), or 0.333 as
	// this is the average chance for the player to have this card.
	// 
	// IMPORTANT! This bot instance is always index 0
	_initChanceToHaveCardArray: function() {
		var tmp = new Array(4);

		// Initialize Array with 3 dimensions, playerId=4, color=4, number=15
		// with 0 initialized for player 0 and with 6x0, 9x0.333 for others
		for (var p = 0; p < 4; p++) { // player
			tmp[p] = new Array(4);
			for (var c = 0; c < 4; c++) { // color
				if (p === 0) {
					tmp[p][c] = new Array(15).fill(0);
				} else {
					tmp[p][c] = new Array(6).fill(0).concat(new Array(9).fill(0.333));
				}
			}
		}
		return tmp;
	},
	_initStich: function() {
		var tmp = new Array(9);
		for (var i = tmp.length - 1; i >= 0; i--) {
			tmp[i] = {};
			tmp[i].playedCards = [];
		}
		return tmp;
	},
	_initArray: function(length, fillValue) {
		return new Array(length).fill(fillValue);
	},
	// When a player is marked for not having a certain color,
	// the chances in chanceToHaveCard are recalculated to ensure
	// no player has a chance to have a card if he can't have this 
	// color anymore
	_adjustChanceToHaveCardAccordingToPlayerHasColorChanges: function() {
		for (var c = 0; c < 4; c++) { // color index
			for (var p = 0; p < this.playerHasColor.length; p++) { // player index
				if (this.playerHasColor[p][c] === 0) {
					this.chanceToHaveCard[p][c] = new Array(15).fill(0);
				}
			}
		}
	},
	// As soon as a player has no cards of a particular color, change his
	// playerHasColor value to zero
	_adjustPlayerHasColorAccordingToChanceToHaveCardChanges: function() {
		for (var p = 0; p < 4; p++) { // player index
			for (var c = 0; c < 4; c++) { // color index
				var needsToChange = true;
				for (var n = 6; n < 15; n++) { // card number
					if (this.chanceToHaveCard[p][c][n] > 0) {
						needsToChange = false;
						break;
					}
				}
				if (needsToChange) {
					this.playerHasColor[p][c] = 0;
				}
			}
		}
	},
	_setPlayerHasColorToZeroWhenAllCardsOfColorArePlayed: function() {
		for (var c = this.cardsOfColorPlayed.length - 1; c >= 0; c--) { // color index
			if (this.cardsOfColorPlayed[c] === 9) {
				for (var p = 0; p < 4; p++) { // player index
					this.playerHasColor[p][c] = 0;
				}
			}
		}
	},
	_setPlayerPosForCurrentStich: function() {
		var playerPosForCurrentStich = ((this.stich[this.stichCount]) && (this.stich[this.stichCount].playedCards)) ? this.stich[this.stichCount].playedCards.length : 0;
		this.stich[this.stichCount].playerPos = playerPosForCurrentStich;
	},
	_recalculateChanceToHaveCard: function() {
		for (var c = 0; c < 4; c++) { // color index
			for (var n = 6; n < 15; n++) { // card number
				// Player does not have the card himself and the card has not been played yet
				if ((this.chanceToHaveCard[0][c][n] === 0) && (this.cardsInGame[c][n] === 0)) {
					let divisor = this.playerHasColor[1][c] + this.playerHasColor[2][c] + this.playerHasColor[3][c];

					for (var p = 1; p < 4; p++) { // player index
						this.chanceToHaveCard[p][c][n] = (divisor === 0) ? 0 : (this.playerHasColor[p][c] * 1) / divisor;
					}
				}
			}
		}
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
		console.log('');
	},
	// Prints the content of the playerHasColor Array
	_printPlayerHasColor: function() {
		console.log('\t\##### - PLAYER HAS COLOR');
		for (var i = 0; i < this.playerHasColor.length; i++) {
			console.log('\t' + JSON.stringify(this.playerHasColor[i]));
		}
	},
	_printStich: function() {
		console.log('\t\##### - STICH');
		for (var i = 0; i < this.stich.length; i++) {
			console.log('\t' + JSON.stringify(this.stich[i]));
		}
	},
	_trackNewlyPlayedCards: function(gameType) {
		var trumpfColor = (gameType.mode === 'TRUMPF') ? gameType.color : '';
		for (var s = 0; s < this.stich.length; s++) { // stich 
			// if the playerPos is assigned
			if (this.stich[s].playerPos) {
				for (var pc = 0; pc < this.stich[s].playedCards.length; pc++) { // played Cards
					var cardToEval = this.stich[s].playedCards[pc] // iteration over playedCards in stich

					// didn't play trumpf
					if (cardToEval.color !== trumpfColor) {
						// but trumpf is leadColor => MARK 'has no trumpf'
						if (this.stich[s].leadColor === trumpfColor) {
							this.markPlayerHasNoCardsOfColor(((this.stich[s].playerPos * 3 + pc) % 4), trumpfColor);
						// and leadColor isn't trumpf either
						} else {
							// but played neither leadColor nor trumpf => MARK 'has no leadColor'
							if (cardToEval.color !== this.stich[s].leadColor) {
								this.markPlayerHasNoCardsOfColor(((this.stich[s].playerPos * 3 + pc) % 4), this.stich[s].leadColor);
							}
						}
					}

					// makes sure that the corresponding player gets marked as having played this card
					this.setHasCard(cardToEval, ((this.stich[s].playerPos * 3 + pc) % 4), 0);
				}
			}
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
let Card = require('./../shared/deck/card');

// Farbenreihenfolge
var Colors = [
	'HEARTS',
	'DIAMONDS',
	'CLUBS',
	'SPADES'
];


// const initCardsInGame = [
// 	// TODO: Einarbeiten
// 	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// HEARTS
// 	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// DIAMONDS
// 	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// CLUBS
// 	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0]		// SPADES
// ];

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
	chanceToHaveCard: [],
	playerId: 0,
	cardsToProcess: [],
	playerHasColor: [],

	initialize: function (handcards) {
		// Initialize both initial values for the Arrays
		this.cardsInGame = this._initCardsInGame();

		this.chanceToHaveCard = JSON.parse(JSON.stringify(initChanceToHaveCard));

		this.playerHasColor = this._initPlayerHasColorArray();

		// Set own cards to 1 for self and 0 for other players
		for (var i = handcards.length - 1; i >= 0; i--) {
			this.setHasCard(handcards[i], 0, 1);
		}
	},
	setCardInGame: function(card) {
		this.cardsInGame[this.mapColorToIndex(card)][card.number] = 0;
	},
	setChanceToHaveCard: function(card, playerId, value) {
		this.chanceToHaveCard[playerId][this.mapColorToIndex(card)][card.number] = value;
	},
	setHasCard: function(card, playerId, value) {
		this.setChanceToHaveCard(card, playerId, value);
		this.setChanceToHaveCard(card, (playerId + 1) % 4, 0);
		this.setChanceToHaveCard(card, (playerId + 2) % 4, 0);
		this.setChanceToHaveCard(card, (playerId + 3) % 4, 0);
	},
	getCardInGame: function(card) {
		return this.cardsInGame[this.mapColorToIndex(card)][card.number];
	},
	getChanceToHaveCard: function(card, playerId) {
		return this.chanceToHaveCard[playerId][this.mapColorToIndex(card)][card.number];
	},
	mapColorToIndex: function(card) {
		return Colors.indexOf(card.color);
	},
	// is being called from brain.registerCardWasPlayer()
	registerCardWasPlayed: function(lastPlayedCard, playedCards) {
		this.cardsToProcess.push(lastPlayedCard);
		this.setCardInGame(lastPlayedCard);
	},
	registerStichCompleted: function(playedCards) {

		// TODO

	},
	// is being called from brain.chooseCard()
	update: function(handcards, tableCards) {
		var curPlayerId = 0;

		console.log('cardsToProcess of ChanceCalc: \n' + JSON.stringify(this.cardsToProcess));

		for (var i = 0; i < this.cardsToProcess.length; i++) {
			this.setHasCard(this.cardsToProcess[i], ((curPlayerId + i) % 4), 0);
		}

		for (var i = this.cardsToProcess.length - 1; i >= 0; i--) {
			this.cardsToProcess.pop();
		}

		this._printCardsInGame();


		// TODO:
		// SPIELER SEATID 3 SOLLTE AN DIESER STELLE KEINE KARTE MEHR HABEN
		// UND DIE ANDEREN BEIDEN SPIELER JEWEILS EINE CHANCE VON 50%!
		// ===============================================================
		// 
		// cardsToProcess of ChanceCalc:
		// [{"number":9,"color":"HEARTS"},{"number":12,"color":"DIAMONDS"}]
		//                         #####
		// [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

		// [0,0,0,0,0,0,0,0,0,0,0.333,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.333]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

		// [0,0,0,0,0,0,0,0,0,0,0.333,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.333]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

		// [0,0,0,0,0,0,0,0,0,0,0.333,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.333]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		// [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

		// -----
		// #####DIAMONDS wurde angespielt. TRUMPF / CLUBS / false
		// -----
		// ### CURRENT STICH CARDS: ###
		// { number: 12, color: 'DIAMONDS' }
		// -----
		// ###### Ist der Stich uns? false
		// -----


		this.cardsToProcess = [];
		this._printChanceToHaveCardArray();
	},
	/**
	 * initCardsInGame[color][number]
	 *  1		Card was played, your team got the stich
	 *  0		Card NOT played, can still be played by anyone
	 * -1		Card was played, opposing team got the stich
	 */
	_initCardsInGame: function() {
		return new Array(4).fill(new Array(15).fill(0));
	},
	// Für jeden Spieler Array mit Farben, die er nicht
	// mehr hat (1 = Spieler hat Farbe, 0 = Spieler hat Farbe nicht mehr)
	_initPlayerHasColorArray: function() {
		return new Array(4).fill(new Array(4).fill(1));
	},
	// Prints the content of the chanceToHaveCard Array
	_printChanceToHaveCardArray: function() {
		console.log('\t\t\t###### - CHANCE TO HAVE CARD');
		for (var i = this.chanceToHaveCard.length - 1; i >= 0; i--) {
			for (var j = this.chanceToHaveCard[i].length - 1; j >= 0; j--) {
				console.log(JSON.stringify(this.chanceToHaveCard[i][j]));
			}
		}
		console.log('\t\t\t######');
	},
	// Prints the content of the cardsInGame Array
	_printCardsInGame: function() {
		console.log('\t\t\t###### - CARDS IN GAME');
		for (var i = this.cardsInGame.length - 1; i >= 0; i--) {
			console.log(JSON.stringify(this.cardsInGame[i]));
		}
		console.log('\t\t\t######');

	}
};

var create = function () {
    var chanceCalc = Object.create(ChanceCalc);
    return chanceCalc;
};

module.exports = {
    create
};
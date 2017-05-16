let Card = require('./../shared/deck/card');

// Farbenreihenfolge
var Colors = [
	'HEARTS',
	'DIAMONDS',
	'CLUBS',
	'SPADES'
];

/**
 * initCardsInGame[color][number]
 *  1		Card was played, your team got the stich
 *  0		Card NOT played
 * -1		Card was played, opposing team got the stich
 */
const initCardsInGame = [
	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// HEARTS
	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// DIAMONDS
	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],		// CLUBS
	[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0]		// SPADES
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
	chanceToHaveCard: [],
	playerId: 0,
	cardsToProcess: [],

	initialize: function (handcards) {
		// Initialize both initial values for the Arrays
		this.cardsInGame = JSON.parse(JSON.stringify(initCardsInGame));
		this.chanceToHaveCard = JSON.parse(JSON.stringify(initChanceToHaveCard));

		// Set own cards to 1 for self and 0 for other players
		for (var i = handcards.length - 1; i >= 0; i--) {
			this.setHasCard(handcards[i], 0, 1);
		}
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
	getChanceToHaveCard: function(card, playerId) {
		return this.chanceToHaveCard[playerId][this.mapColorToIndex(card)][card.number];
	},
	mapColorToIndex: function(card) {
		return Colors.indexOf(card.color);
	},
	// is being called from brain.registerCardWasPlayer()
	registerCardWasPlayed: function(lastPlayedCard, playedCards) {
		this.cardsToProcess.push(lastPlayedCard);
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
	// Prints the content of the chanceToHaveCard Array
	_printChanceToHaveCardArray: function() {
		console.log(
			'\t\t\t#####\n' 
			+ JSON.stringify(this.chanceToHaveCard[0][0]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[0][1]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[0][2]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[0][3]) + '\n\n' 

			+ JSON.stringify(this.chanceToHaveCard[1][0]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[1][1]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[1][2]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[1][3]) + '\n\n'

			+ JSON.stringify(this.chanceToHaveCard[2][0]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[2][1]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[2][2]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[2][3]) + '\n\n'

			+ JSON.stringify(this.chanceToHaveCard[3][0]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[3][1]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[3][2]) + '\n' 
			+ JSON.stringify(this.chanceToHaveCard[3][3]) + '\n' 
			+ '\n\t\t\t#####'
		);	
	}
};

var create = function () {
    var chanceCalc = Object.create(ChanceCalc);
    return chanceCalc;
};

module.exports = {
    create
};
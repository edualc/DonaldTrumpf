let Card = require('./../shared/deck/card');

export class ChanceCalc {

	colors = [
		'HEARTS',
		'DIAMONDS',
		'CLUBS',
		'SPADES'
	],

	// points[trumpfColor][number]
	// 
	// return values:
	// <0	Enemy Team
	points = [
		// HEARTS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// DIAMONDS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// CLUBS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// SPADES
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0]
	],

	/**
	 * played[trumpfColor][number]
	 *
	 * return values:
	 * 0	Card still in game
	 * 1	Card was played
	 */
	played = [
		// HEARTS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// DIAMONDS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// CLUBS
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0],
		// SPADES
		[0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0]
	]
}
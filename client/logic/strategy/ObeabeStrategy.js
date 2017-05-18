import { IStrategy } from './IStrategy.js';

export class ObeabeStrategy extends IStrategy {
	constructor() {
		super();
	}

	bockCount(){
		// overwrite if needed
	}

	posAdditionalBockCount(){
		// possible additional Böcke per color
	}
	
	FailureChance(){
		// get chance that a player can block you
	}

	FailureImpact(){
		// return posAdditionalBockCount * avgPointsPerRound


	}

	EstimatePointsYouGet(){ 

	}
	
	NumberOfTurns(){
		return this.numberOfTurns;
	}
}



/*
	posAdditionalBockCount(){

	}
	
	FailureChance(){
	
	}

	FailureImpact(){

	}

	EstimatePointsYouGet(){ 

	}
	
	NumberOfTurns(){

	}*/

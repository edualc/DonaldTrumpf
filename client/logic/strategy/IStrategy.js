export class IStrategy {
	constructor(){
		if (this.posAdditionalBockCount === undefined){
			throw new TypeError("Must ovverride method");
		}
		if (this.FailureChance === undefined){
			throw new TypeError("Must ovverride method");
		}
		if (this.FailureImpact === undefined){
			throw new TypeError("Must ovverride method");
		}
		if (this.EstimatePointsYouGet === undefined){
			throw new TypeError("Must ovverride method");
		}
		if (this.NumberOfTurns === undefined){
			throw new TypeError("Must ovverride method");
		}
	}

	bockCount(){

	}
}


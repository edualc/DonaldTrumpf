export class IStrategy {
	constructor(){
		if (new.target === IStrategy){
			throw new TypeError("Cannot construct Abstract instances directly");
		}
		if (this.bockCount === undefined){
			throw new TypeError("Must ovverride method");
		}
	}
}

export class ObeabeStrategy extends IStrategy {
	constructor() {
		super();
	}

	bockCount(){
		return this.bockCount;
	}
}

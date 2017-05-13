import { ObeabeStrategy } from './IStrategy.js';

export class StrategyFactory {
	constructor(){ }
	
	getStrategies(){
			return new ObeabeStrategy();
	}
}
